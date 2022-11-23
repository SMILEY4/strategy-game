import {BuildingType} from "./buildingType";
import {TileRef} from "./tileRef";

export interface City {
    cityId: string,
    name: string,
    countryId: string,
    tile: TileRef,
    isProvinceCapital: boolean,
    buildings: ({
        type: BuildingType,
        tile: TileRef | null
    })[]
}