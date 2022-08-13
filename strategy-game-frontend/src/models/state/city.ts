import {Tile} from "./tile";

export interface City {
    cityId: string,
    name: string
    tile: Tile;
}