import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@rendergraph/nodes/rg-node.data.ts";
import type {GlAttributeComponentAmount, GlAttributeType} from "@rendergraph/webgl/gl-program.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TransformVertexOutRenderGraphNode<TIn extends any[], TKeys extends string> extends RenderGraphNodeBase<"transform-vertex-out"> {
    readonly inputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
    readonly outputs: Record<TKeys, VertexDataOutput>
    readonly func: (...args: TIn) => Record<TKeys, VertexDataResult | null>
}

export interface VertexDataOutput {
    readonly content: "vertices" | "instances",
    readonly layout: VertexDataLayout[],
}

export interface VertexDataLayout {
    readonly name: string,
    readonly type: GlAttributeType,
    readonly amountComponents: GlAttributeComponentAmount,
    readonly normalized?: boolean,
}

export interface VertexDataResult {
    readonly data: ArrayBuffer,
    readonly count: number,
}
