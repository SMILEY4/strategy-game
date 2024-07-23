import {TileIdentifier} from "../models/tile";
import {GameRepository} from "./gameRepository";

/**
 * Logic for handling issuing movement of units
 */
export class MovementService {

	private readonly repository: GameRepository;

	constructor(repository: GameRepository) {
		this.repository = repository;
	}

	public isMovementMode(): boolean {
		return this.repository.getCurrentMovementModeState().worldObjectId !== null;
	}

	public startMovement(worldObjectId: string, tile: TileIdentifier) {
		this.repository.setCurrentMovementModeState(worldObjectId, [tile])
	}

	public cancelMovement() {
		this.repository.setCurrentMovementModeState(null, [])
	}

	public completeMovement() {
		this.repository.setCurrentMovementModeState(null, [])
	}

	public addToPath(tileId: TileIdentifier) {
		if(this.getPathCost() < this.getMaxPathCost()) {
			const current = this.repository.getCurrentMovementModeState();
			this.repository.setCurrentMovementModeState(current.worldObjectId, [...current.path, tileId])
		}
	}

	public getPath(): TileIdentifier[] {
		return this.repository.getCurrentMovementModeState().path
	}

	public getPathCost(): number {
		const path = this.repository.getCurrentMovementModeState().path
		return Math.max(0, path.length - 1)
	}

	public getMaxPathCost(): number {
		return 5 // todo: get from unit
	}

}