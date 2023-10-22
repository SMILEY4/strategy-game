import {CountryIdentifier} from "./country";
import {ProvinceIdentifier} from "./province";
import {CityIdentifier} from "./city";

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
    content: ScoutTileContent[]  // todo: fill, display, ...
}

export interface TileInfluence {
    country: CountryIdentifier,
    province: ProvinceIdentifier,
    city: CityIdentifier,
    amount: number
}


export interface ScoutTileContent {
    country: CountryIdentifier,
}