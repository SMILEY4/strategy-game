import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";
import type {CanvasSizeRenderGraphNode} from "@rendergraph/nodes/rg-node.canvas-size.ts";

export interface CameraRenderGraphNode extends RenderGraphNodeBase<"camera"> {
    readonly renderTargetSize: DataRenderGraphNode<[number, number]> | CanvasSizeRenderGraphNode;
    readonly data:
        | PerspectiveCameraData
        | OrthographicCameraData
}

export interface PerspectiveCameraData {
    readonly type: "perspective";
    readonly up: DataRenderGraphNode<[number, number, number]>;
    readonly position: DataRenderGraphNode<[number, number, number]>;
    readonly direction: DataRenderGraphNode<[number, number, number]>;
    readonly fov: DataRenderGraphNode<number>;
    readonly near: DataRenderGraphNode<number>;
    readonly far: DataRenderGraphNode<number>;
}

export interface OrthographicCameraData {
    readonly type: "orthographic";
    readonly up: DataRenderGraphNode<[number, number, number]>;
    readonly position: DataRenderGraphNode<[number, number, number]>;
    readonly direction: DataRenderGraphNode<[number, number, number]>;
    readonly near: DataRenderGraphNode<number>;
    readonly far: DataRenderGraphNode<number>;
}