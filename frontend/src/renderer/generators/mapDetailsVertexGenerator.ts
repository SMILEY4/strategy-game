import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {WasmApi} from "../../wasm/wasmApi";

export namespace MapDetailsVertexGenerator {

	export const OUTPUT_ID = "mapDetails";

	export function funcWasm(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {

		WasmApi.Renderer.updateDetailVertices();
		const wasmVertices = WasmApi.Renderer.getVerticesDetails();
		const wasmVertexCount = WasmApi.Renderer.getVertexCountDetails();

		return buildMap([
			[
				OUTPUT_ID,
				{
					data: wasmVertices,
					entryCount: wasmVertexCount,
				},
			],
		]);
	}

}