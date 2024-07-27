import {WorldObjectType} from "./worldObjectType";
import {TileIdentifier} from "./tile";

export interface WorldObject {
	id: string;
	type: WorldObjectType;
	tile: TileIdentifier;
	movementPoints: number
}