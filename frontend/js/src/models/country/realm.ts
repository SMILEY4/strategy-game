import {Color} from "../../common/color";
import {Player} from "../misc/player";
import {RealmId} from "./realmId";
import {WorldObjectSummary} from "../worldobject/worldObjectSummary";

export interface Realm {
	id: RealmId,
	name: string,
	color: Color,
	ownedByUser: boolean,
	player: Player,
	worldObjects: WorldObjectSummary[],
}