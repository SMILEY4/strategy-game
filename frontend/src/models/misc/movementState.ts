import {WorldObjectId} from "../worldobject/worldObjectId";
import {MovementTarget} from "./movementTarget";

export interface MovementState {
	worldObjectId: WorldObjectId,
	path: MovementTarget[],
	availableTargets: MovementTarget[]
}