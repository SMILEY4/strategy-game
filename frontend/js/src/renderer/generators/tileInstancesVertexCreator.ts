import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {WasmGameRenderer} from "../wasmGameRenderer";

export namespace TileInstanceVertexGenerator {

	export const OUTPUT_WATER_ID = "tiles.instances.water";
	export const OUTPUT_LAND_ID = "tiles.instances.land";
	export const OUTPUT_FOG_ID = "tiles.instances.fog";

	export function funcWasm(context: RenderGraphNodeContext, wasmGameRenderer: WasmGameRenderer): Map<string, VertexGeneratorResult> {

		wasmGameRenderer.updateTerrainTileVertices();
		const [bufferWater, countWater] = wasmGameRenderer.getVerticesWater();
		const [bufferLand, countLand] = wasmGameRenderer.getVerticesLand();
		const [bufferFog, countFog] = wasmGameRenderer.getVerticesFog();

		return buildMap([
			[
				OUTPUT_WATER_ID,
				{
					data: bufferWater,
					entryCount: countWater,
				},
			],
			[
				OUTPUT_LAND_ID,
				{
					data: bufferLand,
					entryCount: countLand,
				},
			],
			[
				OUTPUT_FOG_ID,
				{
					data: bufferFog,
					entryCount: countFog,
				},
			],
		]);
	}

}