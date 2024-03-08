import {ResourceManager} from "./resourceManager";

export interface RenderCommand<TResourceManager extends ResourceManager, TContext> {
    execute(resourceManager: TResourceManager, context: TContext): void
}