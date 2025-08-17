import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {buildMap} from "../../common/utils";
import {Tile} from "../../models/tile/tile";
import {BorderBuilder} from "../utils/borderBuilder";
import {mapHiddenOrNull} from "../../common/hiddenType";
import {TerrainType} from "../../models/tile/terrainType";
import {packBorder} from "../utils/packBorder";
import {TileId} from "../../models/tile/tileId";

export namespace AdditionalTileDataGenerator {

	export const COASTLINE_BORDER_MASK_OUTPUT_ID = "add-tile-data.coastlineBorderMaskData";

	export const EMPTY = new Map<TileId, number>();

	export function func(context: RenderGraphNodeContext): Map<string, any> {
		const tiles = context.get<Tile[]>("tiles");
		const tileByPosProvider = context.get<(q: number, r: number) => Tile | null>("tileByPosProvider");

		// calculate coastline border mask
		const coastlineBorderMask = new Map<TileId, number>();
		for (let i = 0, n = tiles.length; i < n; i++) {
			const tile = tiles[i];

			if (tile.base.visible && tile.base.value.terrainType == TerrainType.WATER) {
				const border = BorderBuilder.build(tile, tileByPosProvider, false, (ta, tb) => {
					const a = mapHiddenOrNull(ta.base, it => it.terrainType);
					const b = mapHiddenOrNull(tb.base, it => it.terrainType);
					return (!a && !b) ? false : a === TerrainType.WATER && b !== null && a !== b;
				});
				const borderPacked = packBorder(border);
				coastlineBorderMask.set(tile.id, borderPacked);
			}

		}

		return buildMap([
			[COASTLINE_BORDER_MASK_OUTPUT_ID, coastlineBorderMask],
		]);
	}

	export function funcWasm(context: RenderGraphNodeContext): Map<string, any> {
		return buildMap([
			[COASTLINE_BORDER_MASK_OUTPUT_ID, EMPTY],
		]);
	}

}