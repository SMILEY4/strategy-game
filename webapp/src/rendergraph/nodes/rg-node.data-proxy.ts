import type {RenderGraphNodeBase} from "@rendergraph/nodes/rg-node.ts";
import type {TransformMultiOutRenderGraphNode} from "@rendergraph/nodes/rg-node.transform-multi-out.ts";

export interface DataProxyRenderGraphNode<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TInMap extends Record<string, any>,
    TKey extends keyof TInMap,
> extends RenderGraphNodeBase<"data-proxy"> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly source: TransformMultiOutRenderGraphNode<any, TInMap>
    readonly sourceKey: TKey,
}