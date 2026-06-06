import type {RenderGraphNodeBase} from "@/modules/rendergraph/nodes/rg-node.ts";
import type {DrawRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.draw.ts";
import type {DataRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.data.ts";
import type {CanvasSizeRenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.canvas-size.ts";

export interface RendertargetRenderGraphNode extends RenderGraphNodeBase<"rendertarget"> {
    readonly size: DataRenderGraphNode<[number, number]> | CanvasSizeRenderGraphNode;
    readonly renderPasses: DrawRenderGraphNode[],
    readonly colorBuffer: boolean,
    readonly depthBuffer: boolean,
    readonly depthTesting: boolean
    readonly clearColor: [number, number, number, number] | null
}