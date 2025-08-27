import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {WasmApi} from "../../wasm/wasmApi";

export namespace OverlayInstancesVertexGenerator {

	export const OUTPUT_ID = "overlay.instances";

	export function funcWasm(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {
		WasmApi.Renderer.updateOverlayTileVertices();
		const wasmOverlay = WasmApi.Renderer.getVerticesOverlay();
		const countOverlay = WasmApi.Renderer.getVerticesOverlayCount();

		return buildMap([
			[
				OUTPUT_ID,
				{
					data: wasmOverlay,
					entryCount: countOverlay,
				},
			],
		]);
	}

}