import {Country} from "./country";
import {Tile} from "./tile";

export interface City {
    cityId: string,
    name: string,
    country: Country,
    tile: Tile;
}