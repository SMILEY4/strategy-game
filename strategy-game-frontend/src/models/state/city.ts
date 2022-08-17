import {Country} from "./country";
import {Province} from "./Province";
import {Tile} from "./tile";

export interface City {
    cityId: string,
    name: string,
    country: Country,
    province: Province,
    tile: Tile;
}