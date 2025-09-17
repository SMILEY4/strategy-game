import {Player} from "../misc/player";
import {RealmId} from "./realmId";
import {Color} from "../../common/color";

export interface RealmEntity {
	id: RealmId,
	name: string,
	color: Color
	player: Player,
	ownedByUser: boolean
}