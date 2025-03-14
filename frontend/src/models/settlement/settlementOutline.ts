import {Color} from "../../common/color";
import {SettlementId} from "./settlementId";
import {TileSummary} from "../tile/tileSummary";

export interface SettlementOutline {
	id: SettlementId,
	name: string,
	color: Color,
	tile: TileSummary,
}