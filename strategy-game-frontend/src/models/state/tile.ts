import {TerrainType} from "./terrainType";
import {TilePosition} from "./tilePosition";

export interface Tile {
    position: TilePosition;
    terrainType: TerrainType;
}