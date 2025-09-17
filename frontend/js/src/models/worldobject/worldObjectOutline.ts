import {TileSummary} from "../tile/tileSummary";
import {RealmSummary} from "../realm/realmSummary";
import {WorldObject} from "./worldObject";

export interface WorldObjectOutline {
	id: WorldObject.Id,
	type: {
		group: string,
		name: string
	},
	tile: TileSummary,
	realm: RealmSummary,
}