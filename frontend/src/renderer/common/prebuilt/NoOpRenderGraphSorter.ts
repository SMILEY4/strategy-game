import {RenderGraphSorter} from "../graph/renderGraphSorter";
import {AbstractRenderNode} from "../graph/nodes/abstractRenderNode";

export class NoOpRenderGraphSorter implements RenderGraphSorter {

    public sort(nodes: AbstractRenderNode[]): AbstractRenderNode[] {
        return nodes;
    }

}