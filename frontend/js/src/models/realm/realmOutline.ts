import {Realm} from "./realm";
import {Color} from "../../common/color/color";

/**
 * The outline information of a realm.
 */
export interface RealmOutline {
	id: Realm.Id,
	name: string
	color: Color,
	playerName: string,
	ownedByUser: boolean,
}

export namespace RealmOutline {

	export function from(realm: Realm): RealmOutline {
		return {
			id: realm.id,
			name: realm.id,
			color: Color.BLACK,
			ownedByUser: realm.ownedByUser,
			playerName: realm.player.name,
		}
	}

}