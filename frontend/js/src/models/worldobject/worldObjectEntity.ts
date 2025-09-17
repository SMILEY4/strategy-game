import {RealmSummary} from "../realm/realmSummary";
import {WorldObjectId} from "./worldObjectId";
import {TileSummary} from "../tile/tileSummary";
import {WorldObjectComponent} from "./worldObjectComponent";

export interface WorldObjectEntity {
	id: WorldObjectId,
	type: {
		group: "unit" | "?",
		name: string
	},
	realm: RealmSummary,
	tile: TileSummary
	components: WorldObjectComponent[]
}