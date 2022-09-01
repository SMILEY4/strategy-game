import {CountryColor} from "./country";
import {TerrainType} from "./terrainType";
import {TilePosition} from "./tilePosition";
import {TileVisibility} from "./tileVisibility";

export interface Tile {
    tileId: string,
    position: TilePosition,
    visibility: TileVisibility,
    borderData: ({
        type: "country" | "province",
        directions: boolean[] // right, bottom-right, bottom-left, ..., top right
    })[]
    generalData: TileGeneralData | null,
    advancedData: TileAdvancedData | null,
}

export interface TileGeneralData {
    terrainType: TerrainType,
    owner: ({
        countryId: string,
        countryColor: CountryColor,
        provinceId: string,
        cityId: string
    }) | null,
}

export interface TileAdvancedData {
    influences: ({
        countryId: string,
        value: number,
        sources: ({
            provinceId: string,
            cityId: string,
            value: number,
        })[]
    })[],
}