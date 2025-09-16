import {TileSummary} from "../tile/tileSummary";
import {RealmSummary} from "../country/realmSummary";
import {WorldObjectId} from "./worldObjectId";

export interface WorldObjectOutline {
	id: WorldObjectId,
	type: {
		group: string,
		name: string
	},
	tile: TileSummary,
	realm: RealmSummary,
}