import {TileId} from "../../../models/tile/tileId";
import {MovementTarget} from "../../../models/misc/movementTarget";

export interface GameClient {
	/**
	 * Get all available positions to move to for the given world object id from the given location
	 */
	getAvailableMovementPositions(worldObjectId: string, tileId: TileId, points: number): Promise<MovementTarget[]>
}