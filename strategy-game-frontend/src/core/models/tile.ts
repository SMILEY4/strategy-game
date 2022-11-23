import {ResourceType} from "./resourceType";
import {TerrainType} from "./terrainType";
import {TilePosition} from "./tilePosition";
import {TileVisibility} from "./tileVisibility";

export interface Tile {
    tileId: string,
    position: TilePosition,
    visibility: TileVisibility,
    layers: TileLayer[],
    dataTier1: TileDataTier1 | null,
    dataTier2: TileDataTier2 | null,
}

export interface TileDataTier1 {
    terrainType: TerrainType,
    resourceType: ResourceType,
    owner: ({
        countryId: string,
        provinceId: string,
        cityId: string | null
    }) | null,
}

export interface TileDataTier2 {
    influences: ({
        countryId: string,
        provinceId: string,
        cityId: string,
        amount: number,
    })[],
}

export interface TileLayer {
    layerId: string,
    value: number[],
    borderDirections: boolean[]
}
