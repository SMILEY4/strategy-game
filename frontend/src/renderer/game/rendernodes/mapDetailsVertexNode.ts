import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../common/graph/vertexRenderNode";
import {GLAttributeType} from "../../../common/webgl/glTypes";
import {buildMap, chooseRandom} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {GameWebGLRenderContext} from "../gameRenderContext";
import {NodeInput} from "../../common/graph/nodeInput";
import {ProvidedNodeInputs} from "../../common/graph/providedNodeInputs";
import {TilemapUtils} from "../../../common/tilemapUtils";
import {SpriteBuffer} from "../../../common/webgl/spriteBuffer";
import {Settlement} from "../../../models/base/Settlement";
import {TextureAtlasEntry} from "../../../common/webgl/textureAtlas";
import {WorldObject} from "../../../models/base/worldObject";
import {TileIdentifier} from "../../../models/base/tile";
import {Visibility} from "../../../models/base/visibility";
import {TerrainType} from "../../../models/base/TerrainType";
import seedrandom from "seedrandom";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import TextureAtlasData = NodeInput.TextureAtlasData;
import {RouteSpriteBuilder} from "./utils/routeSpriteBuilder";
import {Route} from "../../../models/base/route";

export class MapDetailsVertexNode extends VertexRenderNode<GameWebGLRenderContext> {

	public static readonly ID = "vertexnode.mapdetails";

	private readonly spriteBuffer = new SpriteBuffer();

	constructor() {
		super({
			id: MapDetailsVertexNode.ID,
			changeKey: MapDetailsVertexNode.ID,
			input: [
				new TextureAtlasData({
					path: "/icons/full_color.png",
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

		const entriesHouseLvl1 = inputs
			.getTextureAtlasEntryNames("/icons/full_color.png")
			.filter(it => it.startsWith("house_lvl1_"))
			.map(it => inputs.getTextureAtlasEntry("/icons/full_color.png", it));

		const entriesHouseLvl2 = inputs
			.getTextureAtlasEntryNames("/icons/full_color.png")
			.filter(it => it.startsWith("house_lvl2_") || it.startsWith("house_lvl3_"))
			.map(it => inputs.getTextureAtlasEntry("/icons/full_color.png", it));

		const entriesVillageDecoration = inputs
			.getTextureAtlasEntryNames("/icons/full_color.png")
			.filter(it => it.startsWith("village_decoration"))
			.map(it => inputs.getTextureAtlasEntry("/icons/full_color.png", it));

		const entriesMountain = inputs
			.getTextureAtlasEntryNames("/icons/full_color.png")
			.filter(it => it.startsWith("mountain_"))
			.map(it => inputs.getTextureAtlasEntry("/icons/full_color.png", it));

		const entriesForest = inputs
			.getTextureAtlasEntryNames("/icons/full_color.png")
			.filter(it => it.startsWith("forest_"))
			.map(it => inputs.getTextureAtlasEntry("/icons/full_color.png", it));

		const entriesHills = inputs
			.getTextureAtlasEntryNames("/icons/full_color.png")
			.filter(it => it.startsWith("hill_") || it.startsWith("fields_"))
			.map(it => inputs.getTextureAtlasEntry("/icons/full_color.png", it));

		const terrainDecoration = inputs
			.getTextureAtlasEntryNames("/icons/full_color.png")
			.filter(it => it.startsWith("tree_") || it.startsWith("rock_") || it.startsWith("grass_"))
			.map(it => inputs.getTextureAtlasEntry("/icons/full_color.png", it));


		const entryUnit = inputs.getTextureAtlasEntry("/icons/full_color.png", "unit");

		const entryRoad = inputs.getTextureAtlasEntry("/icons/full_color.png", "road");

		// settlements
		const settlements = context.settlements;
		for (let i = 0, n = settlements.length; i < n; i++) {
			const settlement = settlements[i];
			this.addSettlement(this.spriteBuffer, settlement, entriesHouseLvl1, entriesHouseLvl2, entriesVillageDecoration);
		}

		// world objects
		const worldObjects = context.worldObjects;
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			const worldObject = worldObjects[i];
			this.addUnit(this.spriteBuffer, worldObject, entryUnit);
		}

		// routes
		const routes = context.routes;
		for (let i = 0, n = routes.length; i < n; i++) {
			const route = routes[i];
			this.addRoute(this.spriteBuffer, route, entryRoad);
		}

		// terrain todo: temporary until real terrain
		const tiles = context.tiles;
		for (let i = 0, n = tiles.length; i < n; i++) {
			const tile = tiles[i];
			if (tile.visibility !== Visibility.UNKNOWN && tile.base.value.terrainType === TerrainType.LAND) {
				this.addTerrain(this.spriteBuffer, tile.identifier, entriesMountain, entriesHills, entriesForest, terrainDecoration);
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

	private addSettlement(spriteBuffer: SpriteBuffer, settlement: Settlement, houseLevel1: TextureAtlasEntry[], houseLevel2: TextureAtlasEntry[], decorations: TextureAtlasEntry[]) {
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, settlement.tile.q, settlement.tile.r);

		// houses lvl 1
		for (let i = 0; i < (Math.random() * 6) + 5; i++) {
			const atlasEntry = chooseRandom(houseLevel1);
			const rngOffsetX = seedrandom(settlement.identifier.id + i + "x").quick();
			const rngOffsetY = seedrandom(settlement.identifier.id + i + "y").quick();
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

		for (let i = 0; i < (Math.random() * 2) + 1; i++) {
			const atlasEntry = chooseRandom(houseLevel2);
			const rngOffsetX = seedrandom(settlement.identifier.id + i + "x").quick();
			const rngOffsetY = seedrandom(settlement.identifier.id + i + "y").quick();
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
		for (let i = 0; i < settlement.population.size - 1; i++) {
			const atlasEntry = chooseRandom(decorations);
			const rngOffsetX = seedrandom(settlement.identifier.id + i + "x").quick();
			const rngOffsetY = seedrandom(settlement.identifier.id + i + "y").quick();
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

	private addUnit(spriteBuffer: SpriteBuffer, worldObject: WorldObject, atlasEntry: TextureAtlasEntry) {
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, worldObject.tile.q, worldObject.tile.r);
		const x = tileCenter[0];
		const y = tileCenter[1];
		const z = y - 1;
		spriteBuffer.addBillboardSprite({
			atlasEntry: atlasEntry,
			x: x,
			y: y,
			z: z,
			scaleX: 6,
			scaleY: 6,
		});
	}

	private addRoute(spriteBuffer: SpriteBuffer, route: Route, atlasEntry: TextureAtlasEntry){
		const vertexData = RouteSpriteBuilder.build(route, atlasEntry);
		spriteBuffer.addRaw(vertexData)
	}

	private addTerrain(spriteBuffer: SpriteBuffer, tile: TileIdentifier, mountains: TextureAtlasEntry[], hills: TextureAtlasEntry[], forests: TextureAtlasEntry[], plainsDecoration: TextureAtlasEntry[]) {
		const terrainName = this.getRandomTerrainAtlasName(tile);
		const tileCenter = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.q, tile.r);

		if (terrainName === "none") {
			for (let i = 0; i < (Math.random() * 5) + 1; i++) {
				const rngOffsetX = seedrandom(tile.id + i + "x").quick();
				const rngOffsetY = seedrandom(tile.id + i + "y").quick();
				const x = tileCenter[0] + (rngOffsetX * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2);
				const y = tileCenter[1] + (rngOffsetY * 2 - 1) * (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2);
				const z = y - 1;
				spriteBuffer.addBillboardSprite({
					atlasEntry: chooseRandom(plainsDecoration),
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
			const randZ = seedrandom(""+tile.q).quick() * 0.1
			const zMin = tileCenter[1] - TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] + randZ;
			const zMax = tileCenter[1] + TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] + randZ;

			if (terrainName === "mountain") {
				spriteBuffer.addGroundSprite({
					atlasEntry: chooseRandom(mountains),
					x: x,
					y: y,
					z: [zMin, zMax],
					scaleX: 22,
					scaleY: 16,
				});
			}

			if (terrainName === "hill") {
				spriteBuffer.addGroundSprite({
					atlasEntry: chooseRandom(hills),
					x: x,
					y: y,
					z: [zMin, zMax],
					scaleX: 22,
					scaleY: 16,
				});
			}

			if (terrainName === "forest") {
				spriteBuffer.addGroundSprite({
					atlasEntry: chooseRandom(forests),
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
		const value = seedrandom(tile.id).quick();
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