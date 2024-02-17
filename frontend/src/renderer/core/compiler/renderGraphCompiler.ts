import {RenderCommand} from "./renderCommand";
import {AbstractRenderNode} from "../nodes/abstractRenderNode";
import {RenderContext} from "../context/renderContext";

export abstract class RenderGraphCompiler<TContext extends RenderContext> {
    public abstract compile(nodes: AbstractRenderNode[]): RenderCommand<TContext>[];
}