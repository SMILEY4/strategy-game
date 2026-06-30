import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {WasmOperationRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-operation.ts";

export interface WasmDataRenderGraphNode extends RenderGraphNodeBase<"wasm-data"> {
    readonly input: DataRenderGraphNode<any> | WasmOperationRenderGraphNode;
}