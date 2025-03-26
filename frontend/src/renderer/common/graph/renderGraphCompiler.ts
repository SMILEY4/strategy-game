import {RenderCommand} from "./renderCommand";
import {AbstractRenderNode} from "./nodes/abstractRenderNode";

/**
 * Converts the given render-nodes into a sequence of commands
 */
export interface RenderGraphCompiler<TCommand extends RenderCommand<any, any>> {
    validate(nodes: AbstractRenderNode[]): [boolean, string];
    compile(nodes: AbstractRenderNode[]): TCommand[];
}