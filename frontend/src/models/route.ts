import {CityIdentifier} from "./city";
import {TileIdentifier} from "./tile";
import {HiddenType} from "./hiddenType";

export interface Route {
    routeId: string,
    cityA: HiddenType<CityIdentifier>,
    cityB: HiddenType<CityIdentifier>,
    path: TileIdentifier[]
}