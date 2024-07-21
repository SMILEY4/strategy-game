import {TileIdentifier} from "../models/tile";

/**
 * Logic for handling issuing movement of units
 */
export class MovementService {

	private worldObjectId: string | null = null;
	private path: TileIdentifier[] = [];

	public isMovementMode(): boolean {
		return this.worldObjectId !== null;
	}

	public startMovement(worldObjectId: string, tile: TileIdentifier) {
		this.cancelMovement();
		this.worldObjectId = worldObjectId;
		this.addToPath(tile)
	}

	public cancelMovement() {
		this.worldObjectId = null;
		this.path = [];
	}

	public completeMovement() {
		console.log("Move", this.worldObjectId, this.path);
		this.worldObjectId = null;
		this.path = [];
	}

	public addToPath(tileId: TileIdentifier) {
		this.path.push(tileId);
	}

	public getPath(): TileIdentifier[] {
		return this.path;
	}

}