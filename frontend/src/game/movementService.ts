import {TileIdentifier} from "../models/primitives/tile";
import {GameRepository} from "./gameRepository";
import {CommandService} from "./commandService";
import {WorldObject} from "../models/primitives/worldObject";
import {GameClient} from "./gameClient";
import {MovementTarget} from "../models/primitives/movementTarget";

/**
 * Logic for handling movement of world objects
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
		const initTarget: MovementTarget = {
			tile: tile,
			cost: 0,
		};
		this.repository.setCurrentMovementModeState(worldObjectId, [initTarget], await this.getAvailableTargets(tile, worldObject, 0));
	}

	public cancelMovement() {
		this.repository.setCurrentMovementModeState(null, [], []);
	}

	public completeMovement() {
		const current = this.repository.getCurrentMovementModeState();
		if (current.worldObjectId !== null && current.path.length > 0) {
			this.commandService.addMovementCommand(current.worldObjectId, current.path.map(it => it.tile));
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

		const target = current.availableTargets.find(it => it.tile.q == tileId.q && it.tile.r == tileId.r)
		if (target) {
			const newPath = [...current.path, target];
			const newTotalCost = newPath.sum(0, it => it.cost)
			this.repository.setCurrentMovementModeState(current.worldObjectId, newPath, await this.getAvailableTargets(newPath[newPath.length - 1].tile, worldObject, newTotalCost));
			return true;
		}
		return false;
	}

	public getPathCost(): number {
		return this.repository.getCurrentMovementModeState().path.sum(0, it => it.cost)
	}

	public getMaxPathCost(worldObject: WorldObject): number {
		return worldObject.movementPoints;
	}

	private async getAvailableTargets(tile: TileIdentifier, worldObject: WorldObject, points: number): Promise<MovementTarget[]> {
		try {
			return await this.gameClient.getAvailableMovementPositions(worldObject.id, tile, points);
		} catch (e) {
			return [];
		}
	}

}