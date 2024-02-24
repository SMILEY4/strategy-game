import {AbstractRenderNode} from "./abstractRenderNode";

export interface RenderGraphSorter {
    sort(nodes: AbstractRenderNode[]): AbstractRenderNode[];
}