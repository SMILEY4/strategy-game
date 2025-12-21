import {RealmSummary} from "../realm/realmSummary";
import {TileSummary} from "../tile/tileSummary";
import {WorldObjectComponent} from "./worldObjectComponent";
import {BrandedId} from "../../common/brandedId";

export interface WorldObject {
	id: WorldObject.Id,
	type: {
		group: WorldObject.TypeGroup,
		name: string
	},
	realm: RealmSummary,
	tile: TileSummary
	components: WorldObjectComponent[]
}

export interface WorldObjectWithCommand extends WorldObject {
	commandState?: "create" | "destroy"
}

export namespace WorldObject {

	export type Id = BrandedId<string, "WorldObjectId">;

	export enum TypeGroup {
		Unit = "unit",
		TileImprovement = "tileImprovement",
		Settlement = "settlement",
	}

}