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
    terrainType: string,
    owner: {
        country: CountryIdentifier,
        province: ProvinceIdentifier,
        city: CityIdentifier | null
    } | null,
    influences: TileInfluence[]
}

export interface TileInfluence {
    country: CountryIdentifier,
    amount: number
}