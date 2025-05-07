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
			if (property instanceof PropertyRenderGraphNode) {
				const prop = property as PropertyRenderGraphNode<any>;
				execContextEntries.set(prop.getName(), prop.getProvider());
				propertyMapping.set(name, RenderGraphKeys.property(prop))
			}
			if (property instanceof PropertyConstRenderGraphNode) {
				const constProp = property as PropertyConstRenderGraphNode<any>;
				execContextEntries.set(constProp.getName(), () => constProp.getValue());
				propertyMapping.set(name, RenderGraphKeys.property(constProp))
			}
		}

		return [
			new UpdateElementDataRenderGraphCommand(
				node.getName(),
				node.getFunc(),
				execCondition,
				propertyMapping
			),
		];
	}


}
