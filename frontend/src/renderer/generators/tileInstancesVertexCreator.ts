import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../common/webgl/mixedArrayBuffer";
import {buildMap} from "../../common/utils";
import {Tile} from "../../models/tile/tile";
import {Visibility} from "../../models/misc/visibility";
import {TerrainType} from "../../models/tile/terrainType";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {TileId} from "../../models/tile/tileId";
import {sort} from "fast-sort";
import {WasmApi} from "../../wasm/wasmApi";

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
		// color (r,g,b)
		...MixedArrayBufferType.VEC3,
	];

	const FOG_PATTERN = [
		// world position (x,y)
		...MixedArrayBufferType.VEC2,
		// visibility
		MixedArrayBufferType.INT,
	];

	export function funcWasm(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {

		const relevantTiles = context.get<Tile[]>("relevantTiles");
		const tileCounts = countTileTypes(relevantTiles);

		WasmApi.Renderer.update();
		const wasmLand = WasmApi.Renderer.getVerticesLand();
		const wasmWater = WasmApi.Renderer.getVerticesWater();
		const wasmFog = WasmApi.Renderer.getVerticesFog();


		return buildMap([
			[
				OUTPUT_WATER_ID,
				{
					data: wasmWater,
					entryCount: tileCounts.water,
				},
			],
			[
				OUTPUT_LAND_ID,
				{
					data: wasmLand,
					entryCount: tileCounts.land,
				},
			],
			[
				OUTPUT_FOG_ID,
				{
					data: wasmFog,
					entryCount: tileCounts.fog,
				},
			],
		]);
	}

	export function func(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {

		const relevantTiles = context.get<Tile[]>("relevantTiles");
		const coastlineBorderMaskData = context.get<Map<TileId, number>>("coastlineBorderMaskData");

		const colorLandLight = context.get<[number, number, number]>("colorLandLight");
		const colorLandDark = context.get<[number, number, number]>("colorLandDark");

		const tileCounts = countTileTypes(relevantTiles);

		const [arrayBufferWater, cursorWater] = MixedArrayBuffer.createWithCursor(tileCounts.water, WATER_PATTERN);
		const [arrayBufferLand, cursorLand] = MixedArrayBuffer.createWithCursor(tileCounts.land, LAND_PATTERN);
		const [arrayBufferFog, cursorFog] = MixedArrayBuffer.createWithCursor(tileCounts.fog, FOG_PATTERN);

		const shuffledRelevantTiles = sort(relevantTiles).asc(e => e.metaProperties.randomIndex);
		for (let i = 0, n = shuffledRelevantTiles.length; i < n; i++) {
			const tile = shuffledRelevantTiles[i];
			if (isFog(tile)) {
				appendFogInstance(tile, cursorFog);
			}
			if (isLand(tile)) {
				appendLandInstance(tile, cursorLand, colorLandLight, colorLandDark);
			}
			if (isWater(tile)) {
				appendWaterInstance(tile, cursorWater, coastlineBorderMaskData);
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

		// world position
		cursor.append(tile.metaProperties.worldPosition.x);
		cursor.append(tile.metaProperties.worldPosition.y);

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
		coastlineBorderMaskData: Map<TileId, number>,
	) {

		// world position
		cursor.append(tile.metaProperties.worldPosition.x);
		cursor.append(tile.metaProperties.worldPosition.y);

		// color
		const heightJitter = tile.metaProperties.randomValue0 * 0.1 - 0.5;
		cursor.append(1 - clamp(0, (tile.base.value.height + 1) * 2 + heightJitter, 1));

		// water border mask
		cursor.append(coastlineBorderMaskData.get(tile.id)!);
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

		// world position
		cursor.append(tile.metaProperties.worldPosition.x);
		cursor.append(tile.metaProperties.worldPosition.y);

		// color
		const heightJitter = tile.metaProperties.randomValue1 * 0.1 - 0.5;
		const color = mix(colorLight, colorDark, tile.base.value.height * 2 + heightJitter);
		cursor.append(color);
	}


	//===== UTILITIES ===============================================

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