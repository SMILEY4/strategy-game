import {WebGLTextureAtlasDataManager} from "../common/webgl/webGLTextureAtlasDataManager";
import ATLAS_DATA_TILESET from "./textureatlas/tileset.json?raw";


export class GameTextureAtlasDataManager extends WebGLTextureAtlasDataManager {


	constructor() {
		super();
		this.register(
			"/icons/full_color.png",
			ATLAS_DATA_TILESET,
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