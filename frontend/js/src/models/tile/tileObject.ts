import {CountrySummary} from "../country/countrySummary";
import {SettlementSummary} from "../settlement/settlementSummary";
import {WorldObject} from "../worldobject/worldObject";

export interface TileObject { // todo: temp ?
	country: CountrySummary
	settlement: SettlementSummary | null,
	worldObject: WorldObject | null
}