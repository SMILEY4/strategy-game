import {CityIdentifier} from "./city";

export interface Route {
    routeId: string,
    cityA: CityIdentifier,
    cityB: CityIdentifier,
    path: ({
        tileId: string,
        q: number,
        r: number,
    })[]
}