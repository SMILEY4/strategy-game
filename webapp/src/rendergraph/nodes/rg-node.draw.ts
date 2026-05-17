import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";
import type {TextureRenderGraphNode} from "@rendergraph/nodes/rg-node.texture.ts";
import type {RendertargetRenderGraphNode} from "@rendergraph/nodes/rg-node.rendertarget.ts";
import type {ShaderRenderGraphNode} from "@rendergraph/nodes/rg-node.shader.ts";
import type {GeometryRenderGraphNode} from "@rendergraph/nodes/rg-node.geometry.ts";
import type {SelectTextureRenderGraphNode} from "@rendergraph/nodes/rg-node.select-texture.ts";

export interface DrawRenderGraphNode extends RenderGraphNodeBase<"draw"> {
    readonly shader: ShaderRenderGraphNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly geometry: GeometryRenderGraphNode<any>
    readonly inputs: Record<string, DrawRenderGraphNodeInput>
}

export type DrawRenderGraphNodeInput =
    | DataRenderGraphNode<unknown>
    | TextureRenderGraphNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | SelectTextureRenderGraphNode<any, any>
    | RendertargetRenderGraphNode