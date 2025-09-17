import {RealmSummary} from "../realm/realmSummary";
import {TileSummary} from "../tile/tileSummary";
import {WorldObjectComponent} from "./worldObjectComponent";
import {BrandedId} from "../../common/brandedId";

export interface WorldObject {
	id: WorldObject.Id,
	type: {
		group: string,
		name: string
	},
	realm: RealmSummary,
	tile: TileSummary
	components: WorldObjectComponent[]
}

export namespace WorldObject {

	export type Id = BrandedId<string, "WorldObjectId">;

}