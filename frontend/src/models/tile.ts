import {ProvinceIdentifier} from "./province";
import {CityIdentifier} from "./city";
import {CountryIdentifier} from "./country";

export interface TileIdentifier {
    id: string,
    q: number,
    r: number,
}

export interface Tile {
    identifier: TileIdentifier,
    terrainType: "LAND" | "WATER" | "MOUNTAIN" | null,
    visibility: "UNKNOWN" | "DISCOVERED" | "VISIBLE"
    owner: {
        country: CountryIdentifier,
        province: ProvinceIdentifier,
        city: CityIdentifier | null
    } | null,
    influences: TileInfluence[],
    content: ScoutTileContent[]
}

export interface TileInfluence {
    country: CountryIdentifier,
    province: ProvinceIdentifier,
    city: CityIdentifier,
    amount: number
}


export interface ScoutTileContent {
    country: CountryIdentifier
}


export interface TileView {
    identifier: TileIdentifier,
    terrainType: "LAND" | "WATER" | "MOUNTAIN" | null,
    visibility: "UNKNOWN" | "DISCOVERED" | "VISIBLE"
    owner: {
        country: CountryIdentifier,
        province: ProvinceIdentifier,
        city: CityIdentifier | null
    } | null,
    influences: TileInfluence[],
    content: ScoutTileContent[]
}