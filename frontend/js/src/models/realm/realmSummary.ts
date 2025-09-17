import {Color} from "../../common/color";
import {Realm} from "./realm";

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