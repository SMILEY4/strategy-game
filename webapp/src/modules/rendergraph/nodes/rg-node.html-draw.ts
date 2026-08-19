import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";

export interface HtmlDrawRenderGraphNode<TIn extends any[]> extends RenderGraphNodeBase<"html-draw"> {
    readonly inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
    func: (...args: TIn) => string | HTMLElement
}

