import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {VertexCreatorRenderGraphNode} from "../nodes/vertexCreatorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UpdateVertexDataRenderGraphCommand} from "../commands/updateVertexDataRenderGraphCommand";
import {PropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "../nodes/propertyConstRenderGraphNode";

export class VertexCreatorNodeCompiler implements RenderGraphNodeCompiler<VertexCreatorRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof VertexCreatorRenderGraphNode;
	}

	compile(node: VertexCreatorRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {

		const changeTests = [
			...node
				.getInputs()
				.filter(it => it instanceof PropertyRenderGraphNode)
				.map(it => it as PropertyRenderGraphNode<any>)
				.flatMap(it => it.getChangeTests()),
		];
		const execCondition: () => boolean = () => {
			for (let changeTest of changeTests) {
				if (changeTest()) {
					return true;
				}
			}
			return false;
		};

		const execContextEntries = new Map<string, () => any>();
		for (let input of node.getInputs()) {
			if(input instanceof PropertyRenderGraphNode) {
				const prop = input as PropertyRenderGraphNode<any>;
				execContextEntries.set(prop.getName(), prop.getProvider());
			}
			if(input instanceof PropertyConstRenderGraphNode) {
				const constProp = input as PropertyConstRenderGraphNode<any>;
				execContextEntries.set(constProp.getName(), () => constProp.getValue());
			}
		}
		const execContext = new VertexCreatorRenderGraphNode.Context(execContextEntries);

		return [
			new UpdateVertexDataRenderGraphCommand(
				node.getName(),
				node.getFunc(),
				execCondition,
				execContext,
			),
		];
	}

}