import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {ElementCreatorRenderGraphNode} from "../nodes/elementCreatorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {PropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "../nodes/propertyConstRenderGraphNode";
import {ProgrammableNodeContext} from "../nodes/programmableRenderGraphNode";
import {UpdateElementDataRenderGraphCommand} from "../commands/updateElementDataRenderGraphCommand";

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

		const execContextEntries = new Map<string, () => any>();
		for (let input of node.getInputs()) {
			if (input instanceof PropertyRenderGraphNode) {
				const prop = input as PropertyRenderGraphNode<any>;
				execContextEntries.set(prop.getName(), prop.getProvider());
			}
			if (input instanceof PropertyConstRenderGraphNode) {
				const constProp = input as PropertyConstRenderGraphNode<any>;
				execContextEntries.set(constProp.getName(), () => constProp.getValue());
			}
		}
		const execContext = new ProgrammableNodeContext(execContextEntries);

		return [
			new UpdateElementDataRenderGraphCommand(
				node.getName(),
				node.getFunc(),
				execCondition,
				execContext,
			),
		];
	}


}
