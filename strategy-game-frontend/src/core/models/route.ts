import {TileRef} from "./tileRef";

export interface Route {
    routeId: string,
    cityIdA: string,
    cityIdB: string,
    path: TileRef[]
}