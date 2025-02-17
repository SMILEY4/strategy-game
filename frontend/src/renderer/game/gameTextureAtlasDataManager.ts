import {WebGLTextureAtlasDataManager} from "../common/webgl/webGLTextureAtlasDataManager";
// import ATLAS_DATA_TILESET from "./textureatlas/tileset.json?raw";
import {TextureAtlasEntry} from "../../common/webgl/textureAtlas";


export class GameTextureAtlasDataManager extends WebGLTextureAtlasDataManager {


	constructor() {
		super();
		// this.register("/icons/tileset.png", ATLAS_DATA_TILESET)
		console.log("ATLAS", this.buildTileSetAtlasData())
		this.register("/icons/full_color.png", this.buildTileSetAtlasData());
	}

	private buildTileSetAtlasData(): TextureAtlasEntry[] {
		const gridSizeLarge: [number, number] = [15,5]
		const gridSizeSmall: [number, number] = [30,10]

		return [
			this.buildTileSetAtlasEntry(gridSizeLarge, 0, 0, "house_lvl1_01"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 1, 0, "house_lvl1_02"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 2, 0, "house_lvl1_03"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 3, 0, "house_lvl1_04"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 4, 0, "house_lvl1_05"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 5, 0, "house_lvl1_06"),

			this.buildTileSetAtlasEntry(gridSizeLarge, 0, 1, "house_lvl1_07"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 1, 1, "house_lvl1_08"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 2, 1, "house_lvl1_09"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 3, 1, "house_lvl1_10"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 4, 1, "house_lvl1_11"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 5, 1, "house_lvl1_12"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 6, 1, "house_lvl1_13"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 7, 1, "house_lvl1_14"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 8, 1, "house_lvl1_15"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 9, 1, "house_lvl1_16"),

			this.buildTileSetAtlasEntry(gridSizeLarge, 0, 2, "house_lvl1_17"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 1, 2, "house_lvl1_18"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 2, 2, "house_lvl1_19"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 3, 2, "house_lvl1_20"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 4, 2, "house_lvl1_21"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 5, 2, "house_lvl1_22"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 6, 2, "house_lvl1_23"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 7, 2, "house_lvl1_24"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 8, 2, "house_lvl1_25"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 9, 2, "house_lvl1_26"),

			this.buildTileSetAtlasEntry(gridSizeLarge, 3, 3, "house_lvl1_27"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 4, 3, "house_lvl1_28"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 5, 3, "house_lvl1_29"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 6, 3, "house_lvl1_30"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 7, 3, "house_lvl1_31"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 8, 3, "house_lvl1_32"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 9, 3, "house_lvl1_33"),

			this.buildTileSetAtlasEntry(gridSizeLarge, 3, 4, "house_lvl1_34"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 4, 4, "house_lvl1_35"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 5, 4, "house_lvl1_36"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 6, 4, "house_lvl1_37"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 7, 4, "house_lvl1_38"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 8, 4, "house_lvl1_39"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 9, 4, "house_lvl1_40"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 10, 4, "house_lvl1_41"),

			this.buildTileSetAtlasEntry(gridSizeLarge, 6, 0, "house_lvl2_1"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 7, 0, "house_lvl2_2"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 8, 0, "house_lvl2_3"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 9, 0, "house_lvl2_4"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 10, 0, "house_lvl2_5"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 11, 0, "house_lvl2_6"),

			this.buildTileSetAtlasEntry(gridSizeLarge, 2, 3, "mill"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 2, 4, "hut_forest"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 10, 3, "lumber_pile"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 10, 2, "mine_entrance"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 10, 1, "stone_pile"),

			this.buildTileSetAtlasEntry(gridSizeLarge, 11, 2, "mountain_1"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 12, 2, "mountain_2"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 13, 2, "mountain_3"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 11, 1, "forest_1"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 12, 1, "forest_2"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 14, 1, "hill_1"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 14, 2, "hill_2"),

			this.buildTileSetAtlasEntry(gridSizeLarge, 11, 3, "questionmark"),
			this.buildTileSetAtlasEntry(gridSizeLarge, 11, 4, "unit"),

			this.buildTileSetAtlasEntry(gridSizeSmall, 0, 6, "village_decoration_01"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 1, 6, "village_decoration_02"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 2, 6, "village_decoration_03"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 0, 7, "village_decoration_04"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 1, 7, "village_decoration_05"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 2, 7, "village_decoration_06"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 0, 8, "village_decoration_07"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 1, 8, "village_decoration_08"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 2, 8, "village_decoration_09"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 0, 9, "village_decoration_10"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 1, 9, "village_decoration_11"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 2, 9, "village_decoration_12"),

			this.buildTileSetAtlasEntry(gridSizeSmall, 24, 0, "tree_conifer_1"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 25, 0, "tree_conifer_2"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 26, 0, "tree_conifer_3"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 27, 0, "tree_conifer_4"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 28, 0, "tree_conifer_5"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 29, 0, "tree_conifer_6"),

			this.buildTileSetAtlasEntry(gridSizeSmall, 24, 1, "tree_leaf_1"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 25, 1, "tree_leaf_2"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 26, 1, "tree_leaf_3"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 27, 1, "tree_leaf_4"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 28, 1, "tree_leaf_5"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 29, 1, "tree_leaf_6"),

			this.buildTileSetAtlasEntry(gridSizeSmall, 30, 0, "rock_1"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 30, 1, "rock_2"),

			this.buildTileSetAtlasEntry(gridSizeSmall, 26, 2, "grass_1"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 27, 2, "grass_2"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 26, 3, "grass_3"),
			this.buildTileSetAtlasEntry(gridSizeSmall, 27, 3, "grass_4"),
		]
	}

	private buildTileSetAtlasEntry(gridSize: [number, number], x: number, y: number, name: string): TextureAtlasEntry {
		const i = x;
		const j = (gridSize[1]-1) - y;
		const uvsCell: ([number, number])[] = [
			[ 0 / gridSize[0], 0 / gridSize[1] ],
			[ 1 / gridSize[0], 0 / gridSize[1] ],
			[ 1 / gridSize[0], 1 / gridSize[1] ],
			[ 0 / gridSize[0], 0 / gridSize[1] ],
			[ 1 / gridSize[0], 1 / gridSize[1] ],
			[ 0 / gridSize[0], 1 / gridSize[1] ],
		]
		return {
			name: name,
			origin: [0.5, 0.5],
			vertices: [
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 0],
				[1, 1],
				[0, 1],
			],
			textureCoordinates: uvsCell.map(uv => [
				uv[0] + (1 / gridSize[0] * i),
				uv[1] + (1 / gridSize[1] * j),
			]),
		};
	}

}