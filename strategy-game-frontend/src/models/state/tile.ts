import {CountryColor} from "./country";
import {TerrainType} from "./terrainType";
import {TilePosition} from "./tilePosition";
import {TileVisibility} from "./tileVisibility";

export interface Tile {
    tileId: string,
    position: TilePosition,
    visibility: TileVisibility,
    generalData: TileGeneralData | null,
    advancedData: TileAdvancedData | null,
    layers: TileLayer[];
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

export interface TileLayer {
    layerName: string,
    value: number,
    borderDirections: boolean[]
}