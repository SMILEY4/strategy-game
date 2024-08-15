import {HiddenType} from "./hiddenType";
import {Visibility} from "./visibility";
import {TerrainType} from "./TerrainType";
import {TileResourceType} from "./TileResourceType";

export interface TileIdentifier {
	id: string,
	q: number,
	r: number,
}

export interface Tile {
	identifier: TileIdentifier,
	visibility: Visibility
	base: HiddenType<{
		terrainType: TerrainType,
		resourceType: TileResourceType,
		height: number
	}>,
	createSettlement: {
		settler: boolean,
		direct: boolean
	}
}