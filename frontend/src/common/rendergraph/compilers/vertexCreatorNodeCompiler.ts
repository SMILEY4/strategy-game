import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {VertexCreatorRenderGraphNode} from "../nodes/vertexCreatorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UpdateVertexDataRenderGraphCommand} from "../commands/updateVertexDataRenderGraphCommand";
import {PropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "../nodes/propertyConstRenderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";

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

		const propertyMapping: Map<string, string> = new Map<string, string>();

		const execContextEntries = new Map<string, () => any>();
		for (let {property, name} of node.getProperties()) {
			if(property instanceof PropertyRenderGraphNode) {
				const prop = property as PropertyRenderGraphNode<any>;
				execContextEntries.set(prop.getName(), prop.getProvider());
				propertyMapping.set(name, RenderGraphKeys.property(prop))
			}
			if(property instanceof PropertyConstRenderGraphNode) {
				const constProp = property as PropertyConstRenderGraphNode<any>;
				execContextEntries.set(constProp.getName(), () => constProp.getValue());
				propertyMapping.set(name, RenderGraphKeys.property(constProp))
			}
		}

		return [
			new UpdateVertexDataRenderGraphCommand(
				node.getName(),
				node.getFunc(),
				execCondition,
				propertyMapping,
			),
		];
	}

}