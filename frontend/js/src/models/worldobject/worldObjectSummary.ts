import {TileSummary} from "../tile/tileSummary";
import {WorldObjectId} from "./worldObjectId";
import {WorldObject} from "./worldObject";
import {RealmSummary} from "../realm/realmSummary";

export interface WorldObjectSummary {
	id: WorldObjectId,
	type: {
		group: string,
		name: string
	},
	realm: RealmSummary,
	tile: TileSummary,
}

export namespace WorldObjectSummary {

	export function from(worldObject: WorldObject): WorldObjectSummary {
		return {
			id: worldObject.id,
			type: worldObject.type,
			tile: worldObject.tile,
			realm: worldObject.realm,
		}
	}

}