import {TileIdentifier} from "../models/tile";
import {GameRepository} from "./gameRepository";
import {TilePosition} from "../models/tilePosition";
import {CommandService} from "./commandService";
import {WorldObject} from "../models/worldObject";
import {GameClient} from "./gameClient";

/**
 * Logic for handling movement of units
 */
export class MovementService {

	private readonly commandService: CommandService;
	private readonly gameClient: GameClient;
	private readonly repository: GameRepository;

	constructor(commandService: CommandService, gameClient: GameClient, repository: GameRepository) {
		this.commandService = commandService;
		this.gameClient = gameClient;
		this.repository = repository;
	}

	public isMovementMode(): boolean {
		return this.repository.getCurrentMovementModeState().worldObjectId !== null;
	}

	public async startMovement(worldObjectId: string, tile: TileIdentifier) {
		const worldObject = this.repository.getWorldObject(worldObjectId);
		if (worldObject == null) {
			return;
		}
		this.repository.setCurrentMovementModeState(worldObjectId, [tile], await this.getAvailablePositions([tile], worldObject));
	}

	public cancelMovement() {
		this.repository.setCurrentMovementModeState(null, [], []);
	}

	public completeMovement() {
		const current = this.repository.getCurrentMovementModeState();
		if (current.worldObjectId !== null && current.path.length > 0) {
			this.commandService.addMovementCommand(current.worldObjectId, current.path);
		}
		this.repository.setCurrentMovementModeState(null, [], []);
	}

	public async addToPath(tileId: TileIdentifier): Promise<boolean> {
		const current = this.repository.getCurrentMovementModeState();
		if (current.worldObjectId == null) {
			return false;
		}
		const worldObject = this.repository.getWorldObject(current.worldObjectId);
		if (worldObject == null) {
			return false;
		}

		if (this.getPathCost() < this.getMaxPathCost(worldObject) && current.availablePositions.some(it => it.q == tileId.q && it.r == tileId.r)) {
			const newPath = [...current.path, tileId];
			this.repository.setCurrentMovementModeState(current.worldObjectId, newPath, await this.getAvailablePositions(newPath, worldObject));
			return true;
		}
		return false;
	}

	public getPathCost(): number {
		const path = this.repository.getCurrentMovementModeState().path;
		return Math.max(0, path.length - 1);
	}

	public getMaxPathCost(worldObject: WorldObject): number {
		return worldObject.movementPoints;
	}

	private async getAvailablePositions(path: TileIdentifier[], worldObject: WorldObject): Promise<TilePosition[]> {
		try {
			return await this.gameClient.getAvailableMovementPositions(worldObject.id, path[path.length - 1]);
		} catch (e) {
			return [];
		}
	}

}