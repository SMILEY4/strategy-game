import {RenderCommand} from "./renderCommand";
import {AbstractRenderNode} from "./abstractRenderNode";

export interface RenderGraphCompiler<TCommand extends RenderCommand<any, any>> {
    validate(nodes: AbstractRenderNode[]): [boolean, string];
    compile(nodes: AbstractRenderNode[]): TCommand[];
}