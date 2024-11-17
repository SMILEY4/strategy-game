import {AbstractRenderNode} from "./abstractRenderNode";

/**
 * Converts the graph of render-nodes into a valid, flat sequence of nodes
 */
export interface RenderGraphSorter {
    sort(nodes: AbstractRenderNode[]): AbstractRenderNode[];
}