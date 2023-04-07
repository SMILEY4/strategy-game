import {BuildingType} from "./buildingType";
import {TileRef} from "./tileRef";
import {ProductionQueueEntry} from "./productionQueueEntry";

export interface City {
    cityId: string,
    name: string,
    countryId: string,
    tile: TileRef,
    isProvinceCapital: boolean,
    buildings: ({
        type: BuildingType,
        tile: TileRef | null,
        active: boolean
    })[],
    productionQueue: ProductionQueueEntry[]
}