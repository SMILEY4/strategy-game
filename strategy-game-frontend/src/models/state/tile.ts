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
        cityId: string
    }) | null,
}

export interface TileAdvancedData {
    influences: ({
        countryId: string,
        cityId: string,
        amount: number,
    })[],
}

export interface TileLayer {
    layerId: string,
    value: number[],
    borderDirections: boolean[]
}
