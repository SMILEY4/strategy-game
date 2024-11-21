import {WorldObjectType} from "./worldObjectType";
import {TileIdentifier} from "./tile";
import {CountryIdentifier} from "./country";

export interface WorldObject {
	id: string;
	type: WorldObjectType,
	tile: TileIdentifier,
	country: CountryIdentifier,
	movementPoints: number,
	ownedByPlayer: boolean,
}