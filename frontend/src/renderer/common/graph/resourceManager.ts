import {AbstractRenderNode} from "./abstractRenderNode";

/**
 * Manages resources required by the render nodes
 */
export interface ResourceManager {
    initialize(nodes: AbstractRenderNode[]): void;
    dispose(): void
}