import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../common/graph/vertexRenderNode";
import {GLAttributeType} from "../../../common/webgl/glTypes";
import {buildMap} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {GameWebGLRenderContext} from "../gameRenderContext";
import {NodeInput} from "../../common/graph/nodeInput";
import {ProvidedNodeInputs} from "../../common/graph/providedNodeInputs";
import {TilemapUtils} from "../../../common/tilemapUtils";
import {SpriteBuffer} from "../../../common/webgl/spriteBuffer";
import {Visibility} from "../../../models/misc/visibility";
import {RouteSpriteBuilder} from "./utils/routeSpriteBuilder";
import {Random} from "../../../common/random";
import {Color} from "../../../common/color";
import {TerrainType} from "../../../models/tile/terrainType";
import {Settlement} from "../../../models/settlement/settlement";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {Route} from "../../../models/route/route";
import {Tile} from "../../../models/tile/tile";
import {TileId} from "../../../models/tile/tileId";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import TextureAtlasData = NodeInput.TextureAtlasData;

export class MapDetailsVertexNode extends VertexRenderNode<GameWebGLRenderContext> {

	public static readonly ID = "vertexnode.mapdetails";

	private static readonly TEXTURE_ATLAS_NAME = "tileset_details";

	private readonly spriteBuffer = new SpriteBuffer();

	constructor() {
		super({
			id: MapDetailsVertexNode.ID,
			changeKey: MapDetailsVertexNode.ID,
			input: [
				new TextureAtlasData({
					name: MapDetailsVertexNode.TEXTURE_ATLAS_NAME,
				}),
			],
			output: [
				new VertexBuffer({
					name: "vertexbuffer.mapdetails",
					attributes: [
						{
							name: "in_worldPosition",
							type: GLAttributeType.FLOAT,
							amountComponents: 3,
						},
						{
							name: "in_textureCoordinates",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
						},
						{
							name: "in_baseTileColor",
							type: GLAttributeType.FLOAT,
							amountComponents: 3,
						},
						{
							name: "in_countryColor",
							type: GLAttributeType.FLOAT,
							amountComponents: 3,
						},
					],
				}),
				new VertexDescriptor({
					name: "vertexdata.mapdetails",
					type: "standart",
					buffers: ["vertexbuffer.mapdetails"],
				}),
			],
		});
	}

	public execute(context: GameWebGLRenderContext, inputs: ProvidedNodeInputs): VertexDataResource {

		// further performance optimization options
		// - optimize rng (use number instead of strings for seeds)
		// - generate random number for each tile at world creation (in backend) -> use that for different purposes

		this.spriteBuffer.clear();

		// settlements
		const settlements = context.settlements;
		for (let i = 0, n = settlements.length; i < n; i++) {
			this.addSettlement(this.spriteBuffer, settlements[i], inputs);
		}

		// world objects
		const worldObjects = context.worldObjects;
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			this.addUnit(this.spriteBuffer, worldObjects[i], inputs);
		}

		// routes
		const routes = context.routes;
		for (let i = 0, n = routes.length; i < n; i++) {
			this.addRoute(this.spriteBuffer, routes[i], inputs);
		}

		const tiles = context.tiles;
		for (let i = 0, n = tiles.length; i < n; i++) {
			const tile = tiles[i];
			if (tile.visibility !== Visibility.UNKNOWN && tile.base.value.terrainType === TerrainType.LAND) {
				this.addTerrain(this.spriteBuffer, tile, inputs, context);
			}
		}

		return new VertexDataResource({
			buffers: buildMap({
				"vertexbuffer.mapdetails": new VertexBufferResource(this.spriteBuffer.buildRawBuffer()),
			}),
			outputs: buildMap({
				"vertexdata.mapdetails": {
					vertexCount: this.spriteBuffer.getVertexCount(),
					instanceCount: 0,
				},
			}),
		});
	}

	private addSettlement(spriteBuffer: SpriteBuffer, settlement: Settlement, inputs: ProvidedNodeInputs) {
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, settlement.tile.position.q, settlement.tile.position.r);

		const size = settlement.population.size.visible
			? settlement.population.size.value.size
			: 1;

		// houses
		const atlasEntriesHouses = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_NAME, "settlement_houses_all");
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
		const atlasEntriesDecorations = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_NAME, "settlement_decoration");
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

	private addUnit(spriteBuffer: SpriteBuffer, worldObject: WorldObject, inputs: ProvidedNodeInputs) {
		const atlasEntriesUnit = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_NAME, "unit");
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

	private addRoute(spriteBuffer: SpriteBuffer, route: Route, inputs: ProvidedNodeInputs) {
		const atlasEntriesRoad = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_NAME, "road");
		const vertexData = RouteSpriteBuilder.build(route, atlasEntriesRoad[0]);
		spriteBuffer.addRaw(vertexData);
	}

	private addTerrain(spriteBuffer: SpriteBuffer, tile: Tile, inputs: ProvidedNodeInputs, context: GameWebGLRenderContext) {
		const terrainName = this.getRandomTerrainAtlasName(tile.id);
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.position.q, tile.position.r);

		// tile color todo: copied from tiles vertex node -> duplicate !!!
		const heightJitter = Random.normalized(tile.id) * 0.1 - 0.5;
		const color = this.mix(context.renderConfig.land.colorLight, context.renderConfig.land.colorDark, tile.base.value.height * 2 + heightJitter);

		if (terrainName === "none") {
			const atlasEntriesDecorations = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_NAME, "terrain_decoration");
			for (let i = 0; i < (Random.normalized(tile.id) * 5) + 1; i++) {
				const rngOffsetX = Random.normalized(tile.id + i + "x");
				const rngOffsetY = Random.normalized(tile.id + i + "y");
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
			const randZ = Random.normalized("" + tile.position.q) * 0.1;
			const zMin = tileCenter[1] - TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] + randZ;
			const zMax = tileCenter[1] + TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] + randZ;

			if (terrainName === "mountain") {
				const atlasEntriesMountain = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_NAME, "terrain_mountain");
				spriteBuffer.pooledEntry.atlasEntry = Random.chooseRandom(atlasEntriesMountain, tile.position.q + "" + tile.position.r);
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
				const atlasEntriesHill = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_NAME, "terrain_hill");
				spriteBuffer.pooledEntry.atlasEntry = Random.chooseRandom(atlasEntriesHill, tile.position.q + "" + tile.position.r);
				spriteBuffer.pooledEntry.x = x;
				spriteBuffer.pooledEntry.y = y;
				spriteBuffer.pooledEntry.z = [zMin, zMax];
				spriteBuffer.pooledEntry.scaleX = 22;
				spriteBuffer.pooledEntry.scaleY = 16;
				spriteBuffer.pooledEntry.colorCountry = [0, 0, 0];
				spriteBuffer.pooledEntry.colorBaseTile = color;
				spriteBuffer.addPooledGroundSprite();
			}

			if (terrainName === "forest") {
				const atlasEntriesForest = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_NAME, "terrain_forest");
				spriteBuffer.pooledEntry.atlasEntry = Random.chooseRandom(atlasEntriesForest, tile.position.q + "" + tile.position.r)
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

	private getRandomTerrainAtlasName(tileId: TileId): string {
		const value = Random.normalized(tileId);
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

	private mix(x: [number, number, number], y: [number, number, number], a: number): [number, number, number] {
		const clampedA = this.clamp(0, a, 1);
		return [
			x[0] * (1 - clampedA) + y[0] * clampedA,
			x[1] * (1 - clampedA) + y[1] * clampedA,
			x[2] * (1 - clampedA) + y[2] * clampedA,
		];
	}

	private clamp(min: number, value: number, max: number): number {
		return Math.max(min, Math.min(value, max));
	}

}