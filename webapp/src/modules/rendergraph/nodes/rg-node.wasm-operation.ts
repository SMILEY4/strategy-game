import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";

export interface WasmOperationRenderGraphNode<TIn extends any[], TOut extends Record<string, boolean>> extends RenderGraphNodeBase<"wasm-operation"> {
    readonly wasmInputs: WasmDataRenderGraphNode[],
    readonly dataInputs: { [K in keyof TIn]: DataRenderGraphNode<TIn[K]> },
    readonly outputs: (keyof TOut)[]
    readonly func: (...args: TIn) => TOut;
}