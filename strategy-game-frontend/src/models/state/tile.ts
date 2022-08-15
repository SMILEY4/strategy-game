import {Country} from "./country";
import {Province} from "./Province";
import {TerrainType} from "./terrainType";
import {TilePosition} from "./tilePosition";

export interface Tile {
    tileId: string,
    position: TilePosition;
    terrainType: TerrainType;
    influences: ({
        country: Country,
        value: number,
        sources: ({
            province: Province,
            cityId: string,
            value: number
        })[]
    })[],
    owner: {
        country: Country,
        province: Province,
        cityId: string
    } | null
}