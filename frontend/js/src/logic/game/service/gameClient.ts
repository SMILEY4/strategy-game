import {MovementTarget} from "../../../models/misc/movementTarget";
import {Tile} from "../../../models/tile/tile";
import {WorldObject} from "../../../models/worldobject/worldObject";

export interface GameClient {
	/**
	 * Get all available positions to move to for the given world object id from the given location
	 */
	getAvailableMovementPositions(worldObject: WorldObject.Id, tile: Tile.Id, points: number): Promise<MovementTarget[]>;
	/**
	 * Provides a randomly generated name for a settlement.
	 */
	getRandomSettlementName(): Promise<string>;
}