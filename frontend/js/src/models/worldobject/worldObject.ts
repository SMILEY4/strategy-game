import {TileSummary} from "../tile/tileSummary";
import {RealmSummary} from "../realm/realmSummary";
import {WorldObjectId} from "./worldObjectId";
import {WorldObjectComponent} from "./worldObjectComponent";

export interface WorldObject {
	id: WorldObjectId,
	type: {
		group: string,
		name: string
	},
	realm: RealmSummary,
	tile: TileSummary
	components: WorldObjectComponent[]
}