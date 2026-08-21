import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {TextureRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.texture.ts";
import type {ShaderRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.shader.ts";
import type {GeometryRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.geometry.ts";
import type {SelectTextureRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.select-texture.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {CanvasSizeRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.canvas-size.ts";
import type {PickRenderTargetAttachmentRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.pick-attachment.ts";

export interface DrawRenderGraphNode extends RenderGraphNodeBase<"draw"> {
    readonly shader: ShaderRenderGraphNode;
    readonly geometry: GeometryRenderGraphNode;
    readonly inputs: Record<string, DrawRenderGraphNodeInput>;
    readonly blend: null | ((gl: WebGL2RenderingContext) => void)
}

export type DrawRenderGraphNodeInput =
    | TextureRenderGraphNode
    | SelectTextureRenderGraphNode<any, any>
    | PickRenderTargetAttachmentRenderGraphNode<any>
    | DataRenderGraphNode<unknown>
    | CanvasSizeRenderGraphNode
    | CameraRenderGraphNode


