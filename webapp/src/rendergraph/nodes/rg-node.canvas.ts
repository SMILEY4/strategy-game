import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DrawRenderGraphNode} from "@rendergraph/nodes/rg-node.draw.ts";

export interface CanvasRenderGraphNode extends RenderGraphNodeBase<"canvas"> {
    readonly renderPasses: DrawRenderGraphNode[],
    readonly depthTesting: boolean,
    readonly clearColor: [number, number, number, number] | null
}