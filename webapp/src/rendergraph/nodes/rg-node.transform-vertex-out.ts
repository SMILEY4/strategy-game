import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";
import type {GlAttributeComponentAmount, GlAttributeType} from "@rendergraph/webgl/gl-program.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TransformVertexOutRenderGraphNode<TIn extends any[], TKeys extends string> extends RenderGraphNodeBase<"transform-vertex-out"> {
    readonly inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
    readonly outputs: Record<TKeys, VertexDataLayout[]>
    readonly func: (...args: TIn) => Record<TKeys, VertexDataResult | null>
}

export interface VertexDataLayout {
    name: string,
    type: GlAttributeType,
    amountComponents: GlAttributeComponentAmount,
    normalized?: boolean,
    stride?: number,
    offset?: number,
    divisor?: number,
}

export interface VertexDataResult {
    readonly data: ArrayBuffer,
    readonly count: number,
}
