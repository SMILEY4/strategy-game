import {BuildingType} from "./buildingType";
import {TileRef} from "./tileRef";

export interface City {
    cityId: string,
    name: string,
    countryId: string,
    tile: TileRef,
    isCity: boolean,
    parentCity: string | null,
    buildings: ({
        type: BuildingType,
        tile: TileRef | null
    })[]
}