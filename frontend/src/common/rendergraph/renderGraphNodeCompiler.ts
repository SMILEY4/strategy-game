import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphCompileContext} from "./renderGraphCompileContext";
import {RenderGraphCommand} from "./renderGraphCommand";

export interface RenderGraphNodeCompiler<T extends RenderGraphNode<any>> {
	isInlineCompile(): boolean;
	appliesTo(node: RenderGraphNode<any>): boolean;
	compile(node: T, context: RenderGraphCompileContext): RenderGraphCommand[];
}