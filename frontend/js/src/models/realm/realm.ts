import {Player} from "../misc/player";
import {BrandedId} from "../../common/brandedId";
import {Color} from "../../common/color/color";

/**
 * The realm of a player.
 */
export interface Realm {
	id: Realm.Id,
	name: string,
	color: Color
	player: Player,
	ownedByUser: boolean
}

export namespace Realm {

	export type Id = BrandedId<string, "RealmId">;

}