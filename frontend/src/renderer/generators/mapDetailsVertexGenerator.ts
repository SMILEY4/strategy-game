import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {SpriteBuffer} from "../../common/webgl/spriteBuffer";
import {Settlement} from "../../models/settlement/settlement";
import {TilemapUtils} from "../../common/tilemapUtils";
import {Random} from "../../common/random";
import {WorldObject} from "../../models/worldobject/worldObject";
import {Color} from "../../common/color";
import {Route} from "../../models/route/route";
import {Tile} from "../../models/tile/tile";
import {TextureAtlasEntry} from "../../common/webgl/textureAtlas";
import {Visibility} from "../../models/misc/visibility";
import {TerrainType} from "../../models/tile/terrainType";
import {buildMap} from "../../common/utils";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {RouteSpriteBuilder} from "../utils/routeSpriteBuilder";
import {WasmApi} from "../../wasm/wasmApi";

export namespace MapDetailsVertexGenerator {

	export const OUTPUT_ID = "mapDetails";

	const spriteBuffer = new SpriteBuffer();

	export function func(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {

		const relevantTiles = context.get<Tile[]>("relevantTiles");
		const settlements = context.get<Settlement[]>("settlements");
		const worldObjects = context.get<WorldObject[]>("worldObjects");
		const routes = context.get<Route[]>("routes");
		const colorLandLight = context.get<[number, number, number]>("colorLandLight");
		const colorLandDark = context.get<[number, number, number]>("colorLandDark");
		const textureAtlasGroups = context.get<Map<string, TextureAtlasEntry[]>>("textureAtlasGroups");

		// further performance optimization options
		// - optimize rng (use number instead of strings for seeds)
		// - generate random number for each tile at world creation (in backend) -> use that for different purposes

		spriteBuffer.clear();

		// settlements
		for (let i = 0, n = settlements.length; i < n; i++) {
			addSettlement(spriteBuffer, settlements[i], textureAtlasGroups);
		}

		// world objects
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			addUnit(spriteBuffer, worldObjects[i], textureAtlasGroups);
		}

		// routes
		for (let i = 0, n = routes.length; i < n; i++) {
			addRoute(spriteBuffer, routes[i], textureAtlasGroups);
		}

		// terrain
		for (let i = 0, n = relevantTiles.length; i < n; i++) {
			const tile = relevantTiles[i];
			if (tile.visibility !== Visibility.UNKNOWN && tile.base.value.terrainType === TerrainType.LAND) {
				addTerrain(spriteBuffer, tile, textureAtlasGroups, colorLandLight, colorLandDark);
			}
		}

		return buildMap([
			[
				OUTPUT_ID,
				{
					data: spriteBuffer.buildRawBuffer(),
					entryCount: spriteBuffer.getVertexCount(),
				},
			],
		]);
	}

	export function funcWasm(context: RenderGraphNodeContext): Map<string, VertexGeneratorResult> {

		WasmApi.Renderer.updateDetailVertices()
		const wasmVertices = WasmApi.Renderer.getVerticesDetails();
		const wasmVertexCount = WasmApi.Renderer.getVertexCountDetails();

		return buildMap([
			[
				OUTPUT_ID,
				{
					data: wasmVertices,
					entryCount: wasmVertexCount,
				},
			],
		]);
	}


	function addSettlement(spriteBuffer: SpriteBuffer, settlement: Settlement, textureAtlasGroups: Map<string, TextureAtlasEntry[]>) {
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, settlement.tile.position.q, settlement.tile.position.r);

		const size = settlement.population.size.visible
			? settlement.population.size.value.size
			: 1;

		// houses
		const atlasEntriesHouses = textureAtlasGroups.get("settlement_houses_all")!;
		for (let i = 0; i <= size + 1; i++) {
			const atlasEntry = Random.chooseRandom(atlasEntriesHouses, settlement.id + "_" + i);
			const rngOffsetX = Random.normalized(settlement.id + i + "x");
			const rngOffsetY = Random.normalized(settlement.id + i + "y");
			const x = tileCenter[0] + (rngOffsetX * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2);
			const y = tileCenter[1] + (rngOffsetY * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2);
			const z = y - 1;
			spriteBuffer.pooledEntry.atlasEntry = atlasEntry;
			spriteBuffer.pooledEntry.x = x;
			spriteBuffer.pooledEntry.y = y;
			spriteBuffer.pooledEntry.z = z;
			spriteBuffer.pooledEntry.scaleX = 4;
			spriteBuffer.pooledEntry.scaleY = 4;
			spriteBuffer.pooledEntry.colorCountry = [0, 0, 0];
			spriteBuffer.pooledEntry.colorBaseTile = [0, 0, 0];
			spriteBuffer.addPooledBillboardSprite();
		}

		// decorations
		const atlasEntriesDecorations = textureAtlasGroups.get("settlement_decoration")!;
		for (let i = 0; i < size - 1; i++) {
			const atlasEntry = Random.chooseRandom(atlasEntriesDecorations, settlement.id + "_" + i);
			const rngOffsetX = Random.normalized(settlement.id + i + "x");
			const rngOffsetY = Random.normalized(settlement.id + i + "y");
			const x = tileCenter[0] + (rngOffsetX * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2);
			const y = tileCenter[1] + (rngOffsetY * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2);
			const z = y - 1;
			spriteBuffer.pooledEntry.atlasEntry = atlasEntry;
			spriteBuffer.pooledEntry.x = x;
			spriteBuffer.pooledEntry.y = y;
			spriteBuffer.pooledEntry.z = z;
			spriteBuffer.pooledEntry.scaleX = 4;
			spriteBuffer.pooledEntry.scaleY = 4;
			spriteBuffer.pooledEntry.colorCountry = [0, 0, 0];
			spriteBuffer.pooledEntry.colorBaseTile = [0, 0, 0];
			spriteBuffer.addPooledBillboardSprite();
		}
	}

	function addUnit(spriteBuffer: SpriteBuffer, worldObject: WorldObject, textureAtlasGroups: Map<string, TextureAtlasEntry[]>) {
		const atlasEntriesUnit = textureAtlasGroups.get("unit")!;
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, worldObject.tile.position.q, worldObject.tile.position.r);
		const x = tileCenter[0];
		const y = tileCenter[1] - TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2;
		const z = y - 1;

		spriteBuffer.pooledEntry.atlasEntry = atlasEntriesUnit[0];
		spriteBuffer.pooledEntry.x = x;
		spriteBuffer.pooledEntry.y = y;
		spriteBuffer.pooledEntry.z = z;
		spriteBuffer.pooledEntry.scaleX = 6;
		spriteBuffer.pooledEntry.scaleY = 6;
		spriteBuffer.pooledEntry.colorCountry = Color.colorToRgbArray(worldObject.country.color);
		spriteBuffer.pooledEntry.colorBaseTile = [0, 0, 0];
		spriteBuffer.addPooledBillboardSprite();
	}

	function addRoute(spriteBuffer: SpriteBuffer, route: Route, textureAtlasGroups: Map<string, TextureAtlasEntry[]>) {
		const atlasEntriesRoad = textureAtlasGroups.get("road")!;
		const vertexData = RouteSpriteBuilder.build(route, atlasEntriesRoad[0]);
		spriteBuffer.addRaw(vertexData);
	}

	function addTerrain(spriteBuffer: SpriteBuffer, tile: Tile, textureAtlasGroups: Map<string, TextureAtlasEntry[]>, colorLight: [number, number, number], colorDark: [number, number, number]) {
		const terrainName = getRandomTerrainAtlasName(tile);
		const tileCenter = [tile.metaProperties.worldPosition.x, tile.metaProperties.worldPosition.y]

		// tile color todo: copied from tiles vertex node -> duplicate !!!
		const heightJitter = tile.metaProperties.randomValue0 * 0.1 - 0.5;
		const color = mix(colorLight, colorDark, tile.base.value.height * 2 + heightJitter);

		if (terrainName === "none") {
			const atlasEntriesDecorations = textureAtlasGroups.get("terrain_decoration")!;
			for (let i = 0; i < (tile.metaProperties.randomValue1 * 5) + 1; i++) {
				const rngOffsetX = tile.metaProperties.randomValue0;
				const rngOffsetY = tile.metaProperties.randomValue2;
				const x = tileCenter[0] + (rngOffsetX * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2);
				const y = tileCenter[1] + (rngOffsetY * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2);
				const z = y - 1;

				spriteBuffer.pooledEntry.atlasEntry = Random.chooseRandom(atlasEntriesDecorations, tile.id + i);
				spriteBuffer.pooledEntry.x = x;
				spriteBuffer.pooledEntry.y = y;
				spriteBuffer.pooledEntry.z = z;
				spriteBuffer.pooledEntry.scaleX = 4;
				spriteBuffer.pooledEntry.scaleY = 4;
				spriteBuffer.pooledEntry.colorCountry = Color.colorToRgbArray(Color.BLACK);
				spriteBuffer.pooledEntry.colorBaseTile = [0, 0, 0];
				spriteBuffer.addPooledBillboardSprite();
			}

		} else {
			const x = tileCenter[0];
			const y = tileCenter[1] - TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
			const randZ = tile.metaProperties.randomValue2 * 0.1;
			const zMin = tileCenter[1] - TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] + randZ;
			const zMax = tileCenter[1] + TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] + randZ;

			if (terrainName === "mountain") {
				const atlasEntriesMountain = textureAtlasGroups.get("terrain_mountain")!;
				spriteBuffer.pooledEntry.atlasEntry = atlasEntriesMountain.chooseWithRandomValue(tile.metaProperties.randomValue0)
				spriteBuffer.pooledEntry.x = x;
				spriteBuffer.pooledEntry.y = y;
				spriteBuffer.pooledEntry.z = [zMin, zMax];
				spriteBuffer.pooledEntry.scaleX = 22;
				spriteBuffer.pooledEntry.scaleY = 16;
				spriteBuffer.pooledEntry.colorCountry = [0, 0, 0];
				spriteBuffer.pooledEntry.colorBaseTile = color;
				spriteBuffer.addPooledGroundSprite();
			}

			if (terrainName === "hill") {
				const atlasEntriesHill = textureAtlasGroups.get("terrain_hill")!;
				spriteBuffer.pooledEntry.atlasEntry = atlasEntriesHill.chooseWithRandomValue(tile.metaProperties.randomValue0)
				spriteBuffer.pooledEntry.x = x;
				spriteBuffer.pooledEntry.y = y;
				spriteBuffer.pooledEntry.z = [zMin, zMax];
				spriteBuffer.pooledEntry.scaleX = 22;
				spriteBuffer.pooledEntry.scaleY = 16;
				spriteBuffer.pooledEntry.colorCountry = [0, 0, 0];
				spriteBuffer.pooledEntry.colorBaseTile = color;

				if(tile.position.q == -1 && tile.position.r == -1) {
					console.log("[JS DBG]: x,y", x, y)
					console.log("[JS DBG]: z,Z", zMin, zMax)
				}

				spriteBuffer.addPooledGroundSprite();
			}

			if (terrainName === "forest") {
				const atlasEntriesForest = textureAtlasGroups.get("terrain_forest")!;
				spriteBuffer.pooledEntry.atlasEntry = atlasEntriesForest.chooseWithRandomValue(tile.metaProperties.randomValue0)
				spriteBuffer.pooledEntry.x = x;
				spriteBuffer.pooledEntry.y = y;
				spriteBuffer.pooledEntry.z = [zMin, zMax];
				spriteBuffer.pooledEntry.scaleX = 22;
				spriteBuffer.pooledEntry.scaleY = 16;
				spriteBuffer.pooledEntry.colorCountry = [0, 0, 0];
				spriteBuffer.pooledEntry.colorBaseTile = color;
				spriteBuffer.addPooledGroundSprite();
			}
		}
	}

	function getRandomTerrainAtlasName(tile: Tile): string {
		const value = tile.metaProperties.randomValue1;
		if (value > 0.8) {
			return "mountain";
		} else if (value > 0.65) {
			return "hill";
		} else if (value > 0.5) {
			return "forest";
		} else {
			return "none";
		}
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