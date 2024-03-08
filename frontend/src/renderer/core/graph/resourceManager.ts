import {AbstractRenderNode} from "./abstractRenderNode";

export interface ResourceManager {
    initialize(nodes: AbstractRenderNode[]): void;
    dispose(): void
}