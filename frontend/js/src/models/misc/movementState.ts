import {MovementTarget} from "./movementTarget";
import {WorldObject} from "../worldobject/worldObject";

/**
 * The state tracking the "movement mode", i.e when the player plans where to move an object to.
 */
export interface MovementState {
	worldObjectId: WorldObject.Id,
	path: MovementTarget[],
	availableTargets: MovementTarget[]
}