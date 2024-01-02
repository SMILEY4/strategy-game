import {CityIdentifier} from "./city";
import {TileIdentifier} from "./tile";

export interface Route {
    routeId: string,
    cityA: CityIdentifier | null,
    cityB: CityIdentifier | null,
    path: TileIdentifier[]
}