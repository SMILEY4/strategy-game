import {WorldObject} from "../worldobject/worldObject";
import {TileSummary} from "../tile/tileSummary";

/**
 * The state tracking the "movement mode", i.e when the player plans where to move an object to.
 */
export interface MovementState {
	worldObjectId: WorldObject.Id,
	path: TileSummary[],
}