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

		const wasmLand = WasmApi.Renderer.getVerticesLand();
		const wasmWater = WasmApi.Renderer.getVerticesWater();
		const wasmFog = WasmApi.Renderer.getVerticesFog();

		const countLand = WasmApi.Renderer.getVerticesLandCount();
		const countWater = WasmApi.Renderer.getVerticesWaterCount();
		const countFog = WasmApi.Renderer.getVerticesFogCount();

		return buildMap([
			[
				OUTPUT_WATER_ID,
				{
					data: wasmWater,
					entryCount: countWater,
				},
			],
			[
				OUTPUT_LAND_ID,
				{
					data: wasmLand,
					entryCount: countLand,
				},
			],
			[
				OUTPUT_FOG_ID,
				{
					data: wasmFog,
					entryCount: countFog,
				},
			],
		]);
	}

}