import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";
import type {TextureRenderGraphNode} from "@rendergraph/nodes/rg-node.texture.ts";

export interface SelectTextureRenderGraphNode<TIn, TKeys extends string> extends RenderGraphNodeBase<"select-texture"> {
    readonly input: DataRenderGraphNode<TIn>
    readonly options: Record<TKeys, TextureRenderGraphNode>,
    readonly selector: (args: TIn) => TKeys
}