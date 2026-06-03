import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TransformRenderGraphNode<TIn extends any[], TOut> extends RenderGraphNodeBase<"transform"> {
    readonly inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
    readonly func: (...args: TIn) => TOut | null
    readonly checkChanged: (prev: TOut, next: TOut) => boolean
}