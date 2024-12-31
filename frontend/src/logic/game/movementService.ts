import {TileIdentifier} from "../../models/base/tile";
import {CommandService} from "./commandService";
import {WorldObject} from "../../models/base/worldObject";
import {GameClient} from "./gameClient";
import {MovementTarget} from "../../models/base/movementTarget";
import {WorldObjectRepository} from "../../state/repository/worldObjectRepository";
import {CommandRepository} from "../../state/repository/commandRepository";
import {CommandType, MoveCommand} from "../../models/base/command";

/**
 * Logic for handling movement of world objects
 */
export class MovementService {

	private readonly commandService: CommandService;
	private readonly gameClient: GameClient;
	private readonly worldObjectRepository: WorldObjectRepository;
	private readonly commandRepository: CommandRepository;

	constructor(
		commandService: CommandService,
		gameClient: GameClient,
		worldObjectRepository: WorldObjectRepository,
		commandRepository: CommandRepository,
	) {
		this.commandService = commandService;
		this.gameClient = gameClient;
		this.worldObjectRepository = worldObjectRepository;
		this.commandRepository = commandRepository;
	}

	/**
	 * Check whether the local game is currently in movement mode
	 */
	public isMovementMode(): boolean {
		return this.worldObjectRepository.getCurrentMovementModeState().worldObjectId !== null;
	}

	/**
	 * Start movement mode for the given world object currently at the given tile
	 */
	public async startMovement(worldObjectId: string, tile: TileIdentifier) {
		const worldObject = this.worldObjectRepository.get(worldObjectId);
		if (worldObject == null) {
			return;
		}
		const initTarget: MovementTarget = {
			tile: tile,
			cost: 0,
		};
		this.worldObjectRepository.setCurrentMovementModeState(worldObjectId, [initTarget], await this.getAvailableTargets(tile, worldObject, 0));
	}

	/**
	 * End the current movement mode without creating a command
	 */
	public cancelMovement() {
		this.worldObjectRepository.setCurrentMovementModeState(null, [], []);
	}

	/**
	 * Create a new movement command and end the current movement mode
	 */
	public completeMovement() {
		const current = this.worldObjectRepository.getCurrentMovementModeState();
		if (current.worldObjectId !== null && current.path.length > 0) {
			this.commandService.addMovementCommand(current.worldObjectId, current.path.map(it => it.tile));
		}
		this.worldObjectRepository.setCurrentMovementModeState(null, [], []);
	}

	/**
	 * Add the given tile to the current path
	 */
	public async addToPath(tileId: TileIdentifier): Promise<boolean> {
		const current = this.worldObjectRepository.getCurrentMovementModeState();
		if (current.worldObjectId == null) {
			return false;
		}
		const worldObject = this.worldObjectRepository.get(current.worldObjectId);
		if (worldObject == null) {
			return false;
		}

		const target = current.availableTargets.find(it => it.tile.q == tileId.q && it.tile.r == tileId.r);
		if (target) {
			const newPath = [...current.path, target];
			const newTotalCost = newPath.sum(0, it => it.cost);
			this.worldObjectRepository.setCurrentMovementModeState(current.worldObjectId, newPath, await this.getAvailableTargets(newPath[newPath.length - 1].tile, worldObject, newTotalCost));
			return true;
		}
		return false;
	}

	/**
	 * Get the cost of the current path
	 */
	public getPathCost(): number {
		return this.worldObjectRepository.getCurrentMovementModeState().path.sum(0, it => it.cost);
	}

	/**
	 * Get the maximum possible cost of the given world object
	 */
	public getMaxPathCost(worldObject: WorldObject): number {
		return worldObject.movementPoints;
	}

	private async getAvailableTargets(tile: TileIdentifier, worldObject: WorldObject, points: number): Promise<MovementTarget[]> {
		try {
			return await this.gameClient.getAvailableMovementPositions(worldObject.identifier.id, tile, points);
		} catch (e) {
			return [];
		}
	}

	/**
	 * Cancel an already commanded movement of the given world object
	 */
	public cancelMovementCommand(worldObject: WorldObject) {
		this.worldObjectRepository.setCurrentMovementModeState(null, [], []);

		const command = this.commandRepository
			.getAllByType<MoveCommand>(CommandType.MOVE)
			.find(it => it.worldObjectId === worldObject.identifier.id);

		if (command) {
			this.commandService.cancelCommand(command.id);
		}
	}

}