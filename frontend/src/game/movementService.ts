import {TileIdentifier} from "../models/tile";
import {GameRepository} from "./gameRepository";
import {TilePosition} from "../models/tilePosition";

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
		this.repository.setCurrentMovementModeState(worldObjectId, [], []);
		this.addToPath(tile);
	}

	public cancelMovement() {
		this.repository.setCurrentMovementModeState(null, [], []);
	}

	public completeMovement() {
		this.repository.setCurrentMovementModeState(null, [], []);
	}

	public addToPath(tileId: TileIdentifier) {
		if (this.getPathCost() < this.getMaxPathCost()) { // todo: check if in available positions
			const current = this.repository.getCurrentMovementModeState();
			const path = [...current.path, tileId];
			const availablePositions = this.getAvailablePositions(path);
			console.log(availablePositions);
			this.repository.setCurrentMovementModeState(current.worldObjectId, path, availablePositions);
		}
	}

	public getPath(): TileIdentifier[] {
		return this.repository.getCurrentMovementModeState().path;
	}

	public getPathCost(): number {
		const path = this.repository.getCurrentMovementModeState().path;
		return Math.max(0, path.length - 1);
	}

	public getMaxPathCost(): number {
		return 5; // todo: get from unit
	}

	private getAvailablePositions(path: TileIdentifier[]): TilePosition[] {// todo: empty if over max cost
		const head = path[path.length - 1];
		return this.getPositionsRadius(head.q, head.r, 1);
	}

	private getPositionsRadius(q: number, r: number, radius: number): TilePosition[] {// todo: move to utils
		const positions: TilePosition[] = [];
		for (let iq = q - radius; iq <= q + radius; iq++) {
			for (let ir = r - radius; ir <= r + radius; ir++) {
				if (this.hexDistance(q, r, iq, ir) <= radius) {
					positions.push({q: iq, r: ir});
				}
			}
		}
		return positions;
	}

	private hexDistance(q0: number, r0: number, q1: number, r1: number): number { // todo: move to utils
		const q = q0 - q1;
		const r = r0 - r1;
		return (Math.abs(q) + Math.abs(r) + Math.abs(-q - r)) / 2;
	}

}