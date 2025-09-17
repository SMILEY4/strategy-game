import {Realm} from "./realm";
import {Color} from "../../common/color/color";

/**
 * A realm reduced to the minimum amount of information.
 */
export interface RealmSummary {
	id: Realm.Id,
	name: string,
	color: Color
	playerName: string,
	ownedByUser: boolean,
}