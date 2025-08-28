import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {WasmApi} from "../../wasm/wasmApi";

export namespace OverlayInstancesVertexGenerator {

	export const OUTPUT_ID = "overlay.instances";

	export function funcWasm(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {

		WasmApi.Renderer.updateOverlayTileVertices();
		const [buffer, count] = WasmApi.Renderer.getVerticesOverlay()

		return buildMap([
			[
				OUTPUT_ID,
				{
					data: buffer,
					entryCount: count,
				},
			],
		]);
	}

}