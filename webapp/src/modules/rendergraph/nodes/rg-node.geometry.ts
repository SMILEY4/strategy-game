import type {RenderGraphNodeBase} from "@modules/rendergraph/nodes/rg-node.ts";
import type {
    TransformVertexOutRenderGraphNode,
    VertexDataLayout,
    VertexDataResult,
} from "@modules/rendergraph/nodes/rg-node.transform-vertex-out.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";

export interface GeometryRenderGraphNode extends RenderGraphNodeBase<"geometry"> {
    readonly primitiveTypes: "triangles" | "lines";
    readonly sources: (GeometrySource<string> | WasmGeometrySource)[];
}

export interface GeometrySource<TKeys extends string> {
    readonly sourceType: "transformer";
    readonly source: TransformVertexOutRenderGraphNode<any, TKeys>;
    readonly output: TKeys;
}

export interface WasmGeometrySource {
    readonly sourceType: "wasm";
    readonly source: WasmDataRenderGraphNode;
    readonly content: "vertices" | "instances",
    readonly layout: VertexDataLayout[],
    readonly download: () => VertexDataResult
}