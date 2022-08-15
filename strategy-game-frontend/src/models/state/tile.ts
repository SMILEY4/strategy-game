import {Country} from "./country";
import {TerrainType} from "./terrainType";
import {TilePosition} from "./tilePosition";

export interface Tile {
    tileId: string,
    position: TilePosition;
    terrainType: TerrainType;
    influences: ({
        country: Country,
        value: number,
    })[],
    ownerCountry: Country | undefined
}