import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {TransformVertexOutRenderGraphNode} from "@rendergraph/nodes/rg-node.transform-vertex-out.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GeometryRenderGraphNode<T extends GeometrySource<any>[]> extends RenderGraphNodeBase<"geometry"> {
    readonly sources: T;
}

export interface GeometrySource<TKeys extends string = string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly source: TransformVertexOutRenderGraphNode<any, TKeys>;
    readonly output: TKeys;
}

export type GeometryConstrain<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T]: T[K] extends { source: TransformVertexOutRenderGraphNode<any, infer U>, output: infer O }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? { source: TransformVertexOutRenderGraphNode<any, U>, output: U & O }
        : T[K]
};