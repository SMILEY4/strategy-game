import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {ElementCreatorRenderGraphNode} from "../nodes/elementCreatorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {PropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "../nodes/propertyConstRenderGraphNode";
import {UpdateElementDataRenderGraphCommand} from "../commands/updateElementDataRenderGraphCommand";
import {RenderGraphKeys} from "../renderGraphKeys";

export class ElementCreatorNodeCompiler implements RenderGraphNodeCompiler<ElementCreatorRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ElementCreatorRenderGraphNode;
	}


	compile(node: ElementCreatorRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new UpdateElementDataRenderGraphCommand(
				node.getName(),
				node.getFunc(),
				this.buildExecCondition(node),
				this.buildPropertyMapping(node)
			),
		];
	}

	private buildExecCondition(node: ElementCreatorRenderGraphNode): () => boolean {
		const changeTests = [
			...node
				.getInputs()
				.filter(it => it instanceof PropertyRenderGraphNode) // todo: include derived prop nodes
				.map(it => it as PropertyRenderGraphNode<any>)
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

	private buildPropertyMapping(node: ElementCreatorRenderGraphNode): Map<string, string> {
		const propertyMapping: Map<string, string> = new Map<string, string>();

		for (let {property, name} of node.getProperties()) {
			if (property instanceof PropertyRenderGraphNode) {
				const prop = property as PropertyRenderGraphNode<any>;
				propertyMapping.set(name, RenderGraphKeys.property(prop))
			}
			if (property instanceof PropertyConstRenderGraphNode) {
				const constProp = property as PropertyConstRenderGraphNode<any>;
				propertyMapping.set(name, RenderGraphKeys.property(constProp))
			}
			// todo: include derived prop nodes
		}

		return propertyMapping;
	}
}
