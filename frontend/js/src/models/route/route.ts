import {BrandedId} from "../../common/brandedId";
import {TileSummary} from "../tile/tileSummary";
import {HiddenType} from "../../common/hiddenType";
import {WorldObjectSummary} from "../worldobject/worldObjectSummary";

export interface Route {
    id: Route.Id,
    worldObjectA: HiddenType<WorldObjectSummary>,
    worldObjectB: HiddenType<WorldObjectSummary>,
    cost: number,
    path: TileSummary[]
}


export namespace Route {

    export type Id = BrandedId<string, "RouteId">;

}