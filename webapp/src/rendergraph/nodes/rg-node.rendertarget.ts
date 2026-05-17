import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DrawRenderGraphNode} from "@rendergraph/nodes/rg-node.draw.ts";

export interface RendertargetRenderGraphNode extends RenderGraphNodeBase<"rendertarget"> {
    readonly renderPasses: DrawRenderGraphNode[],
}