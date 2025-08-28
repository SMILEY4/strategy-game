import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphCompileContext} from "./renderGraphCompileContext";
import {RenderGraphCommand} from "./renderGraphCommand";

export interface RenderGraphNodeCompiler<T extends RenderGraphNode> {
	isInlineCompile(): boolean;
	appliesTo(node: RenderGraphNode): boolean;
	compile(node: T, context: RenderGraphCompileContext): RenderGraphCommand[];
}