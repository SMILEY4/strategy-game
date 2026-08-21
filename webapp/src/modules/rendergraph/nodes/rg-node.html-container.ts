import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {HtmlDrawRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.html-draw.ts";

export interface HtmlContainerRenderGraphNode extends RenderGraphNodeBase<"html-container"> {
    elementId: string,
    renderPasses: HtmlDrawRenderGraphNode[]
}