import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";

export interface ShaderRenderGraphNode extends RenderGraphNodeBase<"shader"> {
    readonly srcVertex: string,
    readonly srcFragment: string
}