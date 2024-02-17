import {ProvinceIdentifier} from "./province";
import {CityIdentifier} from "./city";
import {CountryIdentifier} from "./country";
import {TerrainType} from "./terrainType";
import {TileVisibility} from "./tileVisibility";
import {TerrainResourceType} from "./terrainResourceType";
import {TileObject} from "./tileObject";
import {HiddenType} from "./hiddenType";
import {RenderObjectData} from "../renderer/core/renderObjectData";

export interface TileIdentifier {
    id: string,
    q: number,
    r: number,
}

export interface Tile {
    identifier: TileIdentifier,
    visibility: TileVisibility
    basic: {
        terrainType: HiddenType<TerrainType>,
        resourceType: HiddenType<TerrainResourceType>
    },
    political: {
        owner: HiddenType<TileOwner | null>,
        influences: HiddenType<TileInfluence[]>,
    }
    objects: HiddenType<TileObject[]>,
    renderData: RenderObjectData | null
}

export interface TileOwner {
    country: CountryIdentifier,
    province: ProvinceIdentifier,
    city: CityIdentifier | null
}

export interface TileInfluence {
    country: CountryIdentifier,
    province: ProvinceIdentifier,
    city: CityIdentifier,
    amount: number
}