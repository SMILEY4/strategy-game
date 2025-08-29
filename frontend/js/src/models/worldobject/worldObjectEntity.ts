import {WorldObjectType} from "./worldObjectType";
import {CountrySummary} from "../country/countrySummary";
import {TileSummary} from "../tile/tileSummary";
import {WorldObjectId} from "./worldObjectId";

export interface WorldObjectEntity {
	id: WorldObjectId,
	type: WorldObjectType,
	tile: TileSummary,
	country: CountrySummary,
	maxMovementPoints: number,
}