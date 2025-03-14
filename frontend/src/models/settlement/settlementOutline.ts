import {TileIdentifier} from "../base/tile";
import {Color} from "../base/color";

export interface SettlementOutline {
	id: string,
	name: string,
	color: Color,
	tile: TileIdentifier,
}