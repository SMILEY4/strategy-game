import {CountryColor} from "./country";
import {TerrainType} from "./terrainType";
import {TilePosition} from "./tilePosition";

export interface Tile {
    tileId: string,
    position: TilePosition;
    terrainType: TerrainType;
    influences: ({
        countryId: string,
        value: number,
        sources: ({
            provinceId: string,
            cityId: string,
            value: number
        })[]
    })[],
    owner: {
        countryId: string,
        countryColor: CountryColor,
        provinceId: string,
        cityId: string
    } | null,
    borderData: ({
        type: "country" | "province"
        directions: boolean[] // right, bottom-right, bottom-left, ..., top right
    })[]
}