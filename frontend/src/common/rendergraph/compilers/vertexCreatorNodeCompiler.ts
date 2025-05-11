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
		return [
			new UpdateVertexDataRenderGraphCommand(
				node.getName(),
				node.getFunc(),
				this.buildExecCondition(node),
				this.buildPropertyMapping(node),
			),
		];
	}

	private buildExecCondition(node: VertexCreatorRenderGraphNode): () => boolean {
		const changeTests = [
			...node
				.getInputs()
				.filter(it => it instanceof PropertyRenderGraphNode)
				.map(it => it as PropertyRenderGraphNode<any>) // todo: include derived prop nodes
				.flatMap(it => it.getChangeTests()),
		];
		return () => {
			for (let changeTest of changeTests) {
				if (changeTest()) {
					return true;
				}
			}
			return false;
		};
	}

	private buildPropertyMapping(node: VertexCreatorRenderGraphNode): Map<string, string> {
		const propertyMapping: Map<string, string> = new Map<string, string>();

		for (let {property, name} of node.getProperties()) {
			if (property instanceof PropertyRenderGraphNode) {
				const prop = property as PropertyRenderGraphNode<any>;
				propertyMapping.set(name, RenderGraphKeys.property(prop));
			}
			if (property instanceof PropertyConstRenderGraphNode) {
				const constProp = property as PropertyConstRenderGraphNode<any>;
				propertyMapping.set(name, RenderGraphKeys.property(constProp));
			}
			// todo: include derived prop nodes
		}

		return propertyMapping;
	}

}