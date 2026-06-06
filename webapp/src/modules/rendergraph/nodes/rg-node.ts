import type {DrawRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.draw.ts";
import type {CanvasRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.canvas.ts";
import type {RendertargetRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.rendertarget.ts";
import type {ShaderRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.shader.ts";
import type {TextureRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.texture.ts";
import type {GeometryRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.geometry.ts";
import type {DataRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.data.ts";
import type {TransformRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.transform.ts";
import type {TransformMultiOutRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.transform-multi-out.ts";
import type {TransformVertexOutRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";
import type {SelectTextureRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.select-texture.ts";
import type {CameraRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.camera.ts";
import type {CanvasSizeRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.canvas-size.ts";

export type RenderGraphNode =
    | CanvasRenderGraphNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | DataRenderGraphNode<any>
    | DrawRenderGraphNode
    | GeometryRenderGraphNode
    | RendertargetRenderGraphNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | SelectTextureRenderGraphNode<any, any>
    | ShaderRenderGraphNode
    | TextureRenderGraphNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | TransformRenderGraphNode<any, any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | TransformMultiOutRenderGraphNode<any, any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | TransformVertexOutRenderGraphNode<any, any>
    | CameraRenderGraphNode
    | CanvasSizeRenderGraphNode

export type RenderGraphNodeId = string

export interface RenderGraphNodeBase<TypeIdentifier extends string> {
    readonly type: TypeIdentifier,
    readonly id: RenderGraphNodeId
}
