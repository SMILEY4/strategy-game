import {TileRef} from "./tileRef";

export interface City {
    cityId: string,
    name: string,
    countryId: string,
    provinceId: string,
    tile: TileRef;
}