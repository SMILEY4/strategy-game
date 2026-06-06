import type {RenderGraphNodeBase} from "@/modules/rendergraph/nodes/rg-node.ts";

export interface ShaderRenderGraphNode extends RenderGraphNodeBase<"shader"> {
    readonly srcVertex: string,
    readonly srcFragment: string,
    readonly prefixVertexAttributes: string | null,
    readonly prefixUniforms: string | null,
}