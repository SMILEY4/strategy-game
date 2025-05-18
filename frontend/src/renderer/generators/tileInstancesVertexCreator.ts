import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../common/webgl/mixedArrayBuffer";
import {buildMap, isPointInRectangle, Rectangle, shuffleArray} from "../../common/utils";
import {Tile} from "../../models/tile/tile";
import {Visibility} from "../../models/misc/visibility";
import {TilemapUtils} from "../../common/tilemapUtils";
import {TerrainType} from "../../models/tile/terrainType";
import {Random} from "../../common/random";
import {mapHiddenOrNull} from "../../common/hiddenType";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {BorderBuilder} from "../utils/borderBuilder";
import {packBorder} from "../utils/packBorder";
import {Projections} from "../../common/webgl/projections";

export namespace TileInstanceVertexGenerator {

	export const OUTPUT_WATER_ID = "tiles.instances.water";
	export const OUTPUT_LAND_ID = "tiles.instances.land";
	export const OUTPUT_FOG_ID = "tiles.instances.fog";

	const WATER_PATTERN = [
		// world position (x,y)
		...MixedArrayBufferType.VEC2,
		// depth
		MixedArrayBufferType.FLOAT,
		// packed water border mask
		MixedArrayBufferType.INT,
	];

	const LAND_PATTERN = [
		// world position (x,y)
		...MixedArrayBufferType.VEC2,
		// color (r,g,b,a)
		...MixedArrayBufferType.VEC4,
	];

	const FOG_PATTERN = [
		// world position (x,y)
		...MixedArrayBufferType.VEC2,
		// visibility
		MixedArrayBufferType.INT,
	];

	let tileIndices: number[] = [];


	export function func(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {

		const relevantTiles = context.get<Tile[]>("relevantTiles");
		const tileByPosProvider = context.get<(q: number, r: number) => Tile | null>("tileByPosProvider");
		const colorLandLight = context.get<[number, number, number]>("colorLandLight");
		const colorLandDark = context.get<[number, number, number]>("colorLandDark");

		const tileCounts = countTileTypes(relevantTiles);

		if (tileIndices.length !== relevantTiles.length) { // todo: define "random" order by pre-computed property of tile
			tileIndices = buildTileIndices(relevantTiles.length);
		}

		const [arrayBufferWater, cursorWater] = MixedArrayBuffer.createWithCursor(tileCounts.water, WATER_PATTERN);
		const [arrayBufferLand, cursorLand] = MixedArrayBuffer.createWithCursor(tileCounts.land, LAND_PATTERN);
		const [arrayBufferFog, cursorFog] = MixedArrayBuffer.createWithCursor(tileCounts.fog, FOG_PATTERN);


		for (let i = 0, n = tileIndices.length; i < n; i++) {
			const index = tileIndices[i];
			const tile = relevantTiles[index];
			if (isFog(tile)) {
				appendFogInstance(tile, cursorFog);
			}
			if (isLand(tile)) {
				appendLandInstance(tile, cursorLand, colorLandLight, colorLandDark);
			}
			if (isWater(tile)) {
				appendWaterInstance(tile, cursorWater, tileByPosProvider);
			}
		}


		return buildMap([
			[
				OUTPUT_WATER_ID,
				{
					data: arrayBufferWater.getRawBuffer(),
					entryCount: tileCounts.water,
				},
			],
			[
				OUTPUT_LAND_ID,
				{
					data: arrayBufferLand.getRawBuffer(),
					entryCount: tileCounts.land,
				},
			],
			[
				OUTPUT_FOG_ID,
				{
					data: arrayBufferFog.getRawBuffer(),
					entryCount: tileCounts.fog,
				},
			],
		]);
	}


	//===== INSTANCES ===============================================

	function countTileTypes(tiles: Tile[]): { land: number, water: number, fog: number } {
		let countLand = 0;
		let countWater = 0;
		let countFog = 0;
		for (let i = 0, n = tiles.length; i < n; i++) {
			const tile = tiles[i];
			if (isFog(tile)) {
				countFog++;
			}
			if (isLand(tile)) {
				countLand++;
			}
			if (isWater(tile)) {
				countWater++;
			}
		}
		return {
			land: countLand,
			water: countWater,
			fog: countFog,
		};
	}


	//===== FOG INSTANCES ===========================================

	function isFog(tile: Tile): boolean {
		return tile.visibility !== Visibility.UNKNOWN;
	}

	function appendFogInstance(tile: Tile, cursor: MixedArrayBufferCursor) {
		const q = tile.position.q;
		const r = tile.position.r;

		// world position
		const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
		cursor.append(center[0]);
		cursor.append(center[1]);

		// visibility
		cursor.append(tile.visibility.renderId);

	}

	//===== WATER INSTANCES =========================================

	function isWater(tile: Tile): boolean {
		return tile.base.visible && tile.base.value.terrainType == TerrainType.WATER;
	}

	function appendWaterInstance(
		tile: Tile,
		cursor: MixedArrayBufferCursor,
		tileByPosProvider: (q: number, r: number) => Tile | null,
	) {
		const q = tile.position.q;
		const r = tile.position.r;

		// world position
		const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
		cursor.append(center[0]);
		cursor.append(center[1]);

		// color
		const heightJitter = Random.normalized(tile.id) * 0.1 - 0.5;
		cursor.append(1 - clamp(0, (tile.base.value.height + 1) * 2 + heightJitter, 1));

		// water border mask
		const border = BorderBuilder.build(tile, tileByPosProvider, false, (ta, tb) => {
			const a = mapHiddenOrNull(ta.base, it => it.terrainType);
			const b = mapHiddenOrNull(tb.base, it => it.terrainType);
			return (!a && !b) ? false : a === TerrainType.WATER && b !== null && a !== b;
		});
		const borderPacked = packBorder(border);
		cursor.append(borderPacked);
	}

	//===== LAND INSTANCES ==========================================

	function isLand(tile: Tile): boolean {
		return tile.base.visible && tile.base.value.terrainType == TerrainType.LAND;
	}

	function appendLandInstance(
		tile: Tile,
		cursor: MixedArrayBufferCursor,
		colorLight: [number, number, number],
		colorDark: [number, number, number],
	) {
		const q = tile.position.q;
		const r = tile.position.r;

		// world position
		const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
		cursor.append(center[0]);
		cursor.append(center[1]);

		// color
		const heightJitter = Random.normalized(tile.id) * 0.1 - 0.5;
		const color = mix(colorLight, colorDark, tile.base.value.height * 2 + heightJitter);
		cursor.append(color);
	}


	//===== UTILITIES ===============================================


	function buildTileIndices(tileCount: number): number[] {
		const indices = [...Array(tileCount).keys()];
		shuffleArray(indices);
		return indices;
	}


	function mix(x: [number, number, number], y: [number, number, number], a: number): [number, number, number] {
		const clampedA = clamp(0, a, 1);
		return [
			x[0] * (1 - clampedA) + y[0] * clampedA,
			x[1] * (1 - clampedA) + y[1] * clampedA,
			x[2] * (1 - clampedA) + y[2] * clampedA,
		];
	}

	function clamp(min: number, value: number, max: number): number {
		return Math.max(min, Math.min(value, max));
	}
}