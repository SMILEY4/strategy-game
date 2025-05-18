import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {InitRenderGraphNode} from "../nodes/initRenderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {UpdateFrameIdRenderGraphCommand} from "../commands/updateFrameIdRenderGraphCommand";

export class InitNodeCompiler implements RenderGraphNodeCompiler<InitRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof InitRenderGraphNode;
	}

	compile(node: InitRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [new UpdateFrameIdRenderGraphCommand(RenderGraphKeys.frameId())];
	}

}