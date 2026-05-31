import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {TransformRenderGraphNode} from "@rendergraph/nodes/rg-node.transform.ts";
import type {TransformMultiOutRenderGraphNode} from "@rendergraph/nodes/rg-node.transform-multi-out.ts";

export interface DataRenderGraphNode<TData> extends RenderGraphNodeBase<"data"> {
    readonly source:
        | { type: "constant", value: TData }
        | { type: "external", fetch: () => TData, checkIsNew: () => boolean }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | { type: "transform", transformer: TransformRenderGraphNode<any, TData> }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | { type: "transform-multi-out", key: string, transformer: TransformMultiOutRenderGraphNode<any, Record<string, any|null>> }
}