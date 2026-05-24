import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";

export interface CameraRenderGraphNode extends RenderGraphNodeBase<"camera"> {
    readonly data:
        | PerspectiveCameraData
        | OrthographicCameraData
        | Camera2dData;
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

export interface Camera2dData {
    readonly type: "2d";
    readonly position: DataRenderGraphNode<[number, number]>;
    readonly zoom: DataRenderGraphNode<number>;
}