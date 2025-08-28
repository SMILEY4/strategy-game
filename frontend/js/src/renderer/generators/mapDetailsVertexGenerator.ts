import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {WasmApi} from "../../wasm/wasmApi";

export namespace MapDetailsVertexGenerator {

	export const OUTPUT_ID = "mapDetails";

	export function funcWasm(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {
		WasmApi.Renderer.updateDetailVertices();
		return buildMap([
			[
				OUTPUT_ID,
				{
					data: WasmApi.Renderer.getVerticesDetails(),
					entryCount: WasmApi.Renderer.getVertexCountDetails(),
				},
			],
		]);
	}

}