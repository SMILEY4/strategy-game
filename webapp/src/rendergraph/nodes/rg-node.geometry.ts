import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {TransformVertexOutRenderGraphNode} from "@rendergraph/nodes/rg-node.transform-vertex-out.ts";

export interface GeometryRenderGraphNode extends RenderGraphNodeBase<"geometry"> {
    readonly sources: GeometrySource<string>[];
}

export interface GeometrySource<TKeys extends string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly source: TransformVertexOutRenderGraphNode<any, TKeys>;
    readonly output: TKeys;
}