import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";

export interface HtmlDrawRenderGraphNode extends RenderGraphNodeBase<"html-draw"> {
    readonly elements: DataRenderGraphNode<HtmlDrawElement[]>;
    readonly instances: DataRenderGraphNode<HtmlDrawInstance[]>;
}

export interface HtmlDrawInstance {
    key: string,
    x: number,
    y: number,
    positioning: "top-left" | "centered"
}

export interface HtmlDrawElement {
    key: string,
    element: HTMLElement
}