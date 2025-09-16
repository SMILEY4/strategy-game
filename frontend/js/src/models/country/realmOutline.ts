import {Color} from "../../common/color";
import {RealmId} from "./realmId";
import {RealmEntity} from "./realmEntity";

export interface RealmOutline {
	id: RealmId,
	name: string
	color: Color,
	ownedByUser: boolean,
	playerName: string,
}

export namespace RealmOutline {

	export function from(realm: RealmEntity): RealmOutline {
		return {
			id: realm.id,
			name: realm.id,
			color: Color.BLACK,
			ownedByUser: realm.ownedByUser,
			playerName: realm.player.name,
		}
	}

}