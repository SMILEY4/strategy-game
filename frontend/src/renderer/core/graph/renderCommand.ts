import {ResourceManager} from "./resourceManager";

/**
 * an abstract command that performs a single action
 */
export interface RenderCommand<TResourceManager extends ResourceManager, TContext> {
    execute(resourceManager: TResourceManager, context: TContext): void
}