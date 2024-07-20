import {TerrainType} from "./TerrainType";
import {TileResourceType} from "./TileResourceType";

export interface TileIdentifier {
	id: string,
	q: number,
	r: number,
}

export interface Tile {
	identifier: TileIdentifier,
	terrainType: TerrainType,
	resourceType: TileResourceType,
	height: number
}