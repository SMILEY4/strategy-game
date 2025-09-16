import {RealmId} from "./realmId";
import {Color} from "../../common/color";

export interface RealmSummary {
	id: RealmId,
	name: string,
	color: Color
	ownedByUser: boolean,
	playerName: string,
}