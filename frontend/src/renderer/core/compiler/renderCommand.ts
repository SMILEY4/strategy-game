import {RenderContext} from "../context/renderContext";

export interface RenderCommand<TContext extends RenderContext> {
    execute(context: TContext): void;
}