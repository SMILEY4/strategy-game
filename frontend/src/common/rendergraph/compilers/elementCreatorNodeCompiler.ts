import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {ElementCreatorRenderGraphNode} from "../nodes/elementCreatorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UpdateElementDataRenderGraphCommand} from "../commands/updateElementDataRenderGraphCommand";
import {PropertyRenderGraphNodeUtils} from "../nodes/propertyRenderGraphNode";

export class ElementCreatorNodeCompiler implements RenderGraphNodeCompiler<ElementCreatorRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof ElementCreatorRenderGraphNode;
	}


	compile(node: ElementCreatorRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new UpdateElementDataRenderGraphCommand(
				node.getName(),
				node.getFunc(),
				node.getChangeTest(),
				PropertyRenderGraphNodeUtils.buildPropertyNameMapping(node.getPropertiesNamed()),
			),
		];
	}

}
