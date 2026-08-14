import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";

export interface PickRenderTargetAttachmentRenderGraphNode<TKeys extends string> extends RenderGraphNodeBase<"pick-rendertarget-attachment"> {
    readonly rendertarget: RendertargetRenderGraphNode<TKeys>,
    readonly attachment: TKeys
}