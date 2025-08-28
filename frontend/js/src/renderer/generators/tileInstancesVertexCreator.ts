import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {WasmApi} from "../../wasm/wasmApi";

export namespace TileInstanceVertexGenerator {

	export const OUTPUT_WATER_ID = "tiles.instances.water";
	export const OUTPUT_LAND_ID = "tiles.instances.land";
	export const OUTPUT_FOG_ID = "tiles.instances.fog";

	export function funcWasm(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {

		WasmApi.Renderer.updateTerrainTileVertices();

		return buildMap([
			[
				OUTPUT_WATER_ID,
				{
					data: WasmApi.Renderer.getVerticesWater(),
					entryCount: WasmApi.Renderer.getVerticesWaterCount(),
				},
			],
			[
				OUTPUT_LAND_ID,
				{
					data: WasmApi.Renderer.getVerticesLand(),
					entryCount: WasmApi.Renderer.getVerticesLandCount(),
				},
			],
			[
				OUTPUT_FOG_ID,
				{
					data: WasmApi.Renderer.getVerticesFog(),
					entryCount: WasmApi.Renderer.getVerticesFogCount(),
				},
			],
		]);
	}

}