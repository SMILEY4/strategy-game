import {TileIdentifier} from "./tile";

export interface MovementTarget {
	tile: TileIdentifier,
	cost: number
}