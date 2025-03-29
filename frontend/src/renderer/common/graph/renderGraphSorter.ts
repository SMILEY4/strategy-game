import {RenderGraphNode} from "../../../common/renderer/nodes/renderGraphNode";

/**
 * Converts the graph of render-nodes into a valid, flat sequence of nodes
 */
export interface RenderGraphSorter {
	sort(nodes: RenderGraphNode[]): RenderGraphNode[];
}