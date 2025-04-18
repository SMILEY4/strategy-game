import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphCommand} from "./renderGraphCommand";
import {RenderGraphCompileContext} from "./renderGraphCompileContext";

export interface RenderGraphNodeCompiler<T extends RenderGraphNode<any>> {
	appliesTo(node: RenderGraphNode<any>): boolean;
	compile(node: T, context: RenderGraphCompileContext): RenderGraphCommand[];
}