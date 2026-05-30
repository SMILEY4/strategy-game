import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";
import type {TextureRenderGraphNode} from "@rendergraph/nodes/rg-node.texture.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SelectTextureRenderGraphNode<TIn extends any[], TKeys extends string> extends RenderGraphNodeBase<"select-texture"> {
    readonly inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
    readonly options: Record<TKeys, TextureRenderGraphNode>,
    readonly selector: (...args: TIn) => TKeys
}