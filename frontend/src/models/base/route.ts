import {SettlementIdentifier} from "./Settlement";
import {TileIdentifier} from "./tile";

export interface Route {
	id: string,
	settlementA: SettlementIdentifier,
	settlementB: SettlementIdentifier,
	path: TileIdentifier[]
}