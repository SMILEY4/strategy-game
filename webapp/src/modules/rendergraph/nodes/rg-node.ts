import type {DrawRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import type {CanvasRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.canvas.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import type {ShaderRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.shader.ts";
import type {TextureRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.texture.ts";
import type {GeometryRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.geometry.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {TransformRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.transform.ts";
import type {TransformMultiOutRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.transform-multi-out.ts";
import type {TransformVertexOutRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";
import type {SelectTextureRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.select-texture.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {CanvasSizeRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.canvas-size.ts";
import type {WasmOperationRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-operation.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import type {PickRenderTargetAttachmentRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.pick-attachment.ts";
import type {HtmlContainerRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.html-container.ts";
import type {HtmlDrawRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.html-draw.ts";

/** Union of all render graph node types. */
export type RenderGraphNode =
    | CanvasRenderGraphNode
    | DataRenderGraphNode<any>
    | DrawRenderGraphNode
    | GeometryRenderGraphNode
    | RendertargetRenderGraphNode<any>
    | SelectTextureRenderGraphNode<any, any>
    | ShaderRenderGraphNode
    | TextureRenderGraphNode
    | TransformRenderGraphNode<any, any>
    | TransformMultiOutRenderGraphNode<any, any>
    | TransformVertexOutRenderGraphNode<any, any>
    | CameraRenderGraphNode
    | CanvasSizeRenderGraphNode
    | WasmDataRenderGraphNode
    | WasmOperationRenderGraphNode<any, any>
    | PickRenderTargetAttachmentRenderGraphNode<any>
    | HtmlContainerRenderGraphNode
    | HtmlDrawRenderGraphNode<any>

/** Unique identifier for a render graph node. */
export type RenderGraphNodeId = string

/** Base interface for all render graph nodes, carrying a type discriminator and unique id. */
export interface RenderGraphNodeBase<TypeIdentifier extends string> {
    readonly type: TypeIdentifier,
    readonly id: RenderGraphNodeId
}
