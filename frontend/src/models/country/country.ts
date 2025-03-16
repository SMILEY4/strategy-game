import {Color} from "../../common/color";
import {Player} from "../misc/player";
import {CountryId} from "./countryId";
import {SettlementSummary} from "../settlement/settlementSummary";
import {WorldObjectSummary} from "../worldobject/worldObjectSummary";

export interface Country {
	id: CountryId,
	name: string,
	color: Color,
	isUserControlled: boolean,
	player: Player,
	settlements: SettlementSummary[],
	worldObjects: WorldObjectSummary[],
}