import {RouteId} from "./routeId";
import {SettlementSummary} from "../settlement/settlementSummary";
import {TileSummary} from "../tile/tileSummary";

export interface RouteEntity {
	id: RouteId,
	settlementA: SettlementSummary,
	settlementB: SettlementSummary,
	path: TileSummary[]
}