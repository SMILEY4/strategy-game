import {BrandedId} from "../../common/brandedId";
import {TileSummary} from "../tile/tileSummary";
import {HiddenType} from "../../common/hiddenType";

export interface Route {
    id: Route.Id,
    worldObjectA: HiddenType<string>,
    worldObjectB: HiddenType<string>,
    cost: number,
    path: TileSummary[]
}


export namespace Route {

    export type Id = BrandedId<string, "RouteId">;

}