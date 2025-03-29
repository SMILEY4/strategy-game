import {RenderGraphSorter} from "../graph/renderGraphSorter";
import {RenderNode} from "../RenderNode";

export class NoOpRenderGraphSorter implements RenderGraphSorter {

    public sort(nodes: RenderNode[]): RenderNode[] {
        return nodes;
    }

}