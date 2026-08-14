import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {DrawRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {CanvasSizeRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.canvas-size.ts";
import {type GLColorStoreFormat, GLDepthStoreFormat} from "@modules/rendergraph/webgl/gl-framebuffer.ts";

export interface RendertargetRenderGraphNode<TKeys extends string> extends RenderGraphNodeBase<"rendertarget"> {
    readonly size: DataRenderGraphNode<[number, number]> | CanvasSizeRenderGraphNode;
    readonly renderPasses: DrawRenderGraphNode[],
    readonly attachments: Record<TKeys, RendertargetAttachment>
    readonly clearColor: [number, number, number, number] | null,
    readonly depthTesting: boolean,
}

export type RendertargetAttachment = RendertargetColorAttachment | RendertargetDepthAttachment

export interface RendertargetColorAttachment {
    type: "color"
    format: GLColorStoreFormat
}

export interface RendertargetDepthAttachment {
    type: "depth"
    format: GLDepthStoreFormat
}