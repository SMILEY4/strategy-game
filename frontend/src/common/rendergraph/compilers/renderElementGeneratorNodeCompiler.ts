import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderElementGeneratorRenderGraphNode} from "../nodes/renderElementGeneratorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UpdateRenderElementDataRenderGraphCommand} from "../commands/updateRenderElementDataRenderGraphCommand";
import {PropertyRenderGraphNodeUtils} from "../nodes/propertyRenderGraphNode";

export class RenderElementGeneratorNodeCompiler implements RenderGraphNodeCompiler<RenderElementGeneratorRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof RenderElementGeneratorRenderGraphNode;
	}


	compile(node: RenderElementGeneratorRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new UpdateRenderElementDataRenderGraphCommand(
				node.getName(),
				node.getGeneratorFunction(),
				node.getChangeTest(),
				PropertyRenderGraphNodeUtils.buildPropertyNameMapping(node.getPropertiesNamed()),
			),
		];
	}

}
