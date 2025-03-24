import {WebGLTextureAtlasDataManager} from "../common/webgl/webGLTextureAtlasDataManager";
import ATLAS_DATA_TILESET from "./textureatlas/tileset.json?raw";


export class GameTextureAtlasDataManager extends WebGLTextureAtlasDataManager {


	constructor() {
		super();
		this.register(
			"tileset_details",
			ATLAS_DATA_TILESET,
			[
				{
					name: "rock_01",
					scale: 0.5,
				},
				{
					name: "rock_02",
					scale: 0.5,
				},
				{
					name: "grass_01",
					scale: 0.5,
				},
				{
					name: "grass_02",
					scale: 0.5,
				},
				{
					name: "grass_03",
					scale: 0.5,
				},
				{
					name: "grass_04",
					scale: 0.5,
				},
				{
					name: "unit",
					scale: 1.25,
				},
			],
			[
				{
					name: "settlement_houses_lvl1",
					entrySelector: name => name.startsWith("house_lvl1_")
				},
				{
					name: "settlement_houses_lvl2",
					entrySelector: name => name.startsWith("house_lvl2_")
				},
				{
					name: "settlement_houses_all",
					entrySelector: name => name.startsWith("house_lvl1_") || name.startsWith("house_lvl2_")
				},
				{
					name: "settlement_decoration",
					entrySelector: name => name.startsWith("village_decoration")
				},
				{
					name: "terrain_mountain",
					entrySelector: name => name.startsWith("mountain_")
				},
				{
					name: "terrain_forest",
					entrySelector: name => name.startsWith("forest_")
				},
				{
					name: "terrain_hill",
					entrySelector: name => name.startsWith("hills_")
				},
				{
					name: "terrain_decoration",
					entrySelector: name => name.startsWith("tree_") || name.startsWith("rock_") || name.startsWith("grass_")
				},
				{
					name: "unit",
					entryNames: ["unit"]
				},
				{
					name: "road",
					entryNames: ["road"]
				},
				{
					name: "unknown",
					entryNames: ["unknown"]
				},
			]
		)
	}

}