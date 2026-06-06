import type {RenderGraphNodeBase} from "@/modules/rendergraph/nodes/rg-node.ts";
import type {DrawRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.draw.ts";

export interface CanvasRenderGraphNode extends RenderGraphNodeBase<"canvas"> {
    readonly renderPasses: DrawRenderGraphNode[],
    readonly depthTesting: boolean,
    readonly clearColor: [number, number, number, number] | null
}