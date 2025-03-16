import {WorldObjectType} from "./worldObjectType";
import {TileSummary} from "../tile/tileSummary";
import {CountrySummary} from "../country/countrySummary";
import {WorldObjectId} from "./worldObjectId";

export interface WorldObjectSummary {
	id: WorldObjectId,
	type: WorldObjectType,
	tile: TileSummary,
}