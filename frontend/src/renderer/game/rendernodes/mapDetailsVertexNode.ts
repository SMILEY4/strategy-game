import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../common/graph/vertexRenderNode";
import {GLAttributeType} from "../../../common/webgl/glTypes";
import {buildMap} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {GameWebGLRenderContext} from "../gameRenderContext";
import {NodeInput} from "../../common/graph/nodeInput";
import {ProvidedNodeInputs} from "../../common/graph/providedNodeInputs";
import {TilemapUtils} from "../../../common/tilemapUtils";
import {SpriteBuffer} from "../../../common/webgl/spriteBuffer";
import {Settlement} from "../../../models/base/Settlement";
import {WorldObject} from "../../../models/base/worldObject";
import {TileIdentifier} from "../../../models/base/tile";
import {Visibility} from "../../../models/base/visibility";
import {TerrainType} from "../../../models/base/TerrainType";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import TextureAtlasData = NodeInput.TextureAtlasData;
import {RouteSpriteBuilder} from "./utils/routeSpriteBuilder";
import {Route} from "../../../models/base/route";
import {Random} from "../../../common/random";

export class MapDetailsVertexNode extends VertexRenderNode<GameWebGLRenderContext> {

	public static readonly ID = "vertexnode.mapdetails";

	private static readonly TEXTURE_ATLAS_PATH = "/icons/full_color.png";

	private readonly spriteBuffer = new SpriteBuffer();

	constructor() {
		super({
			id: MapDetailsVertexNode.ID,
			changeKey: MapDetailsVertexNode.ID,
			input: [
				new TextureAtlasData({
					path: MapDetailsVertexNode.TEXTURE_ATLAS_PATH,
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

		this.spriteBuffer.clear();

		// settlements
		const settlements = context.settlements;
		for (let i = 0, n = settlements.length; i < n; i++) {
			const settlement = settlements[i];
			this.addSettlement(this.spriteBuffer, settlement, inputs);
		}

		// world objects
		const worldObjects = context.worldObjects;
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			const worldObject = worldObjects[i];
			this.addUnit(this.spriteBuffer, worldObject, inputs);
		}

		// routes
		const routes = context.routes;
		for (let i = 0, n = routes.length; i < n; i++) {
			const route = routes[i];
			this.addRoute(this.spriteBuffer, route, inputs);
		}

		const tiles = context.tiles;
		for (let i = 0, n = tiles.length; i < n; i++) {
			const tile = tiles[i];
			if (tile.visibility !== Visibility.UNKNOWN && tile.base.value.terrainType === TerrainType.LAND) {
				this.addTerrain(this.spriteBuffer, tile.identifier, inputs);
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
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, settlement.tile.q, settlement.tile.r);


		// houses
		const atlasEntriesHouses = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_PATH, "settlement_houses_all")
		for (let i = 0; i <= settlement.population.size - 1; i++) {
			const atlasEntry = Random.chooseRandom(atlasEntriesHouses, settlement.identifier.id + "_" + i);
			const rngOffsetX = Random.normalized(settlement.identifier.id + i + "x");
			const rngOffsetY = Random.normalized(settlement.identifier.id + i + "y");
			const x = tileCenter[0] + (rngOffsetX * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2);
			const y = tileCenter[1] + (rngOffsetY * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2);
			const z = y - 1;
			spriteBuffer.addBillboardSprite({
				atlasEntry: atlasEntry,
				x: x,
				y: y,
				z: z,
				scaleX: 4,
				scaleY: 4,
			});
		}

		// decorations
		const atlasEntriesDecorations = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_PATH, "settlement_decoration")
		for (let i = 0; i < settlement.population.size - 1; i++) {
			const atlasEntry = Random.chooseRandom(atlasEntriesDecorations, settlement.identifier.id + "_" + i);
			const rngOffsetX = Random.normalized(settlement.identifier.id + i + "x");
			const rngOffsetY = Random.normalized(settlement.identifier.id + i + "y");
			const x = tileCenter[0] + (rngOffsetX * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2);
			const y = tileCenter[1] + (rngOffsetY * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2);
			const z = y - 1;
			spriteBuffer.addBillboardSprite({
				atlasEntry: atlasEntry,
				x: x,
				y: y,
				z: z,
				scaleX: 4,
				scaleY: 4,
			});
		}
	}

	private addUnit(spriteBuffer: SpriteBuffer, worldObject: WorldObject, inputs: ProvidedNodeInputs) {
		const atlasEntriesUnit = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_PATH, "unit")
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, worldObject.tile.q, worldObject.tile.r);
		const x = tileCenter[0];
		const y = tileCenter[1] - TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2;
		const z = y - 1;
		spriteBuffer.addBillboardSprite({
			atlasEntry: atlasEntriesUnit[0],
			x: x,
			y: y,
			z: z,
			scaleX: 6,
			scaleY: 6,
		});
	}

	private addRoute(spriteBuffer: SpriteBuffer, route: Route, inputs: ProvidedNodeInputs){
		const atlasEntriesRoad = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_PATH, "road")
		const vertexData = RouteSpriteBuilder.build(route, atlasEntriesRoad[0]);
		spriteBuffer.addRaw(vertexData)
	}

	private addTerrain(spriteBuffer: SpriteBuffer, tile: TileIdentifier, inputs: ProvidedNodeInputs) {
		const terrainName = this.getRandomTerrainAtlasName(tile);
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.q, tile.r);

		if (terrainName === "none") {
			const atlasEntriesDecorations = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_PATH, "terrain_decoration")
			for (let i = 0; i < (Random.normalized(tile.id) * 5) + 1; i++) {
				const rngOffsetX = Random.normalized(tile.id + i + "x");
				const rngOffsetY = Random.normalized(tile.id + i + "y");
				const x = tileCenter[0] + (rngOffsetX * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2);
				const y = tileCenter[1] + (rngOffsetY * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2);
				const z = y - 1;
				spriteBuffer.addBillboardSprite({
					atlasEntry: Random.chooseRandom(atlasEntriesDecorations, tile.id + i),
					x: x,
					y: y,
					z: z,
					scaleX: 4,
					scaleY: 4,
				});
			}

		} else {
			const x = tileCenter[0];
			const y = tileCenter[1] - TilemapUtils.DEFAULT_HEX_LAYOUT.size[1];
			const randZ = Random.normalized(""+tile.q) * 0.1
			const zMin = tileCenter[1] - TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] + randZ;
			const zMax = tileCenter[1] + TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] + randZ;

			if (terrainName === "mountain") {
				const atlasEntriesMountain = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_PATH, "terrain_mountain")
				spriteBuffer.addGroundSprite({
					atlasEntry: Random.chooseRandom(atlasEntriesMountain, tile.id),
					x: x,
					y: y,
					z: [zMin, zMax],
					scaleX: 22,
					scaleY: 16,
				});
			}

			if (terrainName === "hill") {
				const atlasEntriesHill = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_PATH, "terrain_hill")
				spriteBuffer.addGroundSprite({
					atlasEntry: Random.chooseRandom(atlasEntriesHill, tile.id),
					x: x,
					y: y,
					z: [zMin, zMax],
					scaleX: 22,
					scaleY: 16,
				});
			}

			if (terrainName === "forest") {
				const atlasEntriesForest = inputs.getTextureAtlasGroup(MapDetailsVertexNode.TEXTURE_ATLAS_PATH, "terrain_forest")
				spriteBuffer.addGroundSprite({
					atlasEntry: Random.chooseRandom(atlasEntriesForest, tile.id),
					x: x,
					y: y,
					z: [zMin, zMax],
					scaleX: 22,
					scaleY: 16,
				});
			}
		}
	}

	private getRandomTerrainAtlasName(tile: TileIdentifier): string {
		const value = Random.normalized(tile.id);
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

}