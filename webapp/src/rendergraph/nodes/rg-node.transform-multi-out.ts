import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TransformMultiOutRenderGraphNode<TIn extends any[], TOut extends Record<string, any | null>> extends RenderGraphNodeBase<"transform-multi-out"> {
    readonly inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
    readonly func: (...args: TIn) => TOut
}