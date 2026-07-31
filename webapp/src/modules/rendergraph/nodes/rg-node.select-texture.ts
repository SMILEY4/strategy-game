import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {TextureRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.texture.ts";

export interface SelectTextureRenderGraphNode<TIn extends any[], TKeys extends string> extends RenderGraphNodeBase<"select-texture"> {
    readonly inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
    readonly options: Record<TKeys, TextureRenderGraphNode>,
    readonly selector: (...args: TIn) => TKeys
}