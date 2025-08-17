import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {buildMap, isPointInRectangle, Rectangle} from "../../common/utils";
import {Tile} from "../../models/tile/tile";
import {Projections} from "../../common/webgl/projections";
import {WasmApi} from "../../wasm/wasmApi";

export namespace RelevantTilesDataGenerator {

	export const OUTPUT_ID = "relevantTiles";

	export function func(context: RenderGraphNodeContext): Map<string, any> {
		const relevantWorldArea = context.get<Rectangle>("relevantWorldArea");
		const tiles = context.get<Tile[]>("tiles");

		const relevantTiles = tiles.filter(tile => {
			const worldPos = Projections.hexToWorld(tile.position.q, tile.position.r)
			return isPointInRectangle(worldPos, relevantWorldArea)
		})

		return buildMap([
			[OUTPUT_ID, relevantTiles],
		]);
	}

	export function funcWasm(context: RenderGraphNodeContext): Map<string, any> {
		const tiles = context.get<Tile[]>("tiles");

		WasmApi.Renderer.setTiles(tiles);

		return buildMap([
			[OUTPUT_ID, tiles],
		]);
	}

}