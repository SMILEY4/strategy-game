import {ProvinceIdentifier} from "./province";
import {CityIdentifier} from "./city";
import {CountryIdentifier} from "./country";
import {TerrainType} from "./terrainType";
import {Visibility} from "./visibility";
import {ResourceType} from "./resourceType";
import {TerrainResourceType, TerrainResourceTypeString} from "./terrainResourceType";
import {TileObject} from "./tileObject";

export interface TileIdentifier {
    id: string,
    q: number,
    r: number,
}

export interface Tile {
    identifier: TileIdentifier,
    terrainType: TerrainType | null,
    resourceType: TerrainResourceType | null
    visibility: Visibility
    owner: {
        country: CountryIdentifier,
        province: ProvinceIdentifier,
        city: CityIdentifier | null
    } | null,
    influences: TileInfluence[],
    objects: TileObject[]
}

export interface TileInfluence {
    country: CountryIdentifier,
    province: ProvinceIdentifier,
    city: CityIdentifier,
    amount: number
}


export interface TileView {
    identifier: TileIdentifier,
    terrainType: TerrainType | null,
    resourceType: TerrainResourceType | null,
    visibility: Visibility
    owner: {
        country: CountryIdentifier,
        province: ProvinceIdentifier,
        city: CityIdentifier | null
    } | null,
    influences: TileInfluence[],
    objects: TileObject[]
}