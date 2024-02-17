import {RenderNodeResourceEntry} from "../nodes/abstractRenderNode";

export interface ResourceManager {
    initialize(declaredResources: RenderNodeResourceEntry[]): void
    dispose(): void
}