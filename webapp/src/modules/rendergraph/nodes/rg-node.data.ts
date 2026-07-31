import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {TransformRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.transform.ts";
import type {TransformMultiOutRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.transform-multi-out.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";

export interface DataRenderGraphNode<TData> extends RenderGraphNodeBase<"data"> {
    readonly source:
        | { type: "constant", value: TData }
        | { type: "external", fetch: () => TData, checkChanged: (prev: TData) => boolean }
        | { type: "transform", transformer: TransformRenderGraphNode<any, TData> }
        | { type: "transform-multi-out", key: string, transformer: TransformMultiOutRenderGraphNode<any, Record<string, any|null>> }
        | { type: "wasm", value: WasmDataRenderGraphNode, download: () => TData }
}