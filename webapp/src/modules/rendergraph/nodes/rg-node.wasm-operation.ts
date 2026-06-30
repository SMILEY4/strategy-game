import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";

export interface WasmOperationRenderGraphNode extends RenderGraphNodeBase<"wasm-operation"> {
    readonly func: () => void;
}