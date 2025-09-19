import {GameStateAccess} from "../../../state/gameStateAccess";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {MovementTarget} from "../../../models/misc/movementTarget";
import {CommandService} from "./commandService";
import {GameClient} from "./gameClient";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {Tile} from "../../../models/tile/tile";
import {Command} from "../../../models/command/command";

export interface MovementService {
	/**
	 * Whether the game is currently in "move" mode
	 */
	isMovementActive(): boolean;
	/**
	 * Start "move" mode for the given world object
	 */
	beginMovement(worldObjectId: WorldObject.Id): Promise<void>;
	/**
	 * End the movement and submit a command
	 */
	completeMovement(): void;
	/**
	 * End the movement without submitting a command
	 */
	cancelMovement(): void;
	/**
	 * Add the given tile to the current movement path
	 */
	addStep(tileId: Tile.Id): Promise<boolean>;
}

export class MovementServiceImpl implements MovementService {

	private readonly localStateAccess: GameStateAccess;
	private readonly gameStateWriter: GameStateWriter;
	private readonly gameClient: GameClient;
	private readonly commandService: CommandService;

	constructor(localStateAccess: GameStateAccess, gameStateWriter: GameStateWriter, gameClient: GameClient, commandService: CommandService) {
		this.localStateAccess = localStateAccess;
		this.gameStateWriter = gameStateWriter;
		this.gameClient = gameClient;
		this.commandService = commandService;
	}

	isMovementActive(): boolean {
		return this.localStateAccess.getCurrentMovementState() !== null;
	}

	beginMovement(worldObjectId: WorldObject.Id): Promise<void> {
		const worldObject = this.localStateAccess.getWorldObjectSummary(worldObjectId);
		if (!worldObject) {
			return Promise.resolve();
		}
		return this.getAvailableTargets(worldObject.tile.id, worldObjectId, 0)
			.then((availableTargets) => {
				this.gameStateWriter.setMovementState({
					worldObjectId: worldObjectId,
					path: [{
						tile: worldObject.tile,
						cost: 0,
					}],
					availableTargets: availableTargets,
				});
				this.gameStateWriter.setHighlightedTiles(availableTargets.map(it => it.tile.position))
			});
	}

	completeMovement(): void {
		const currentMovementState = this.localStateAccess.getCurrentMovementState();
		if (currentMovementState && currentMovementState.path.length > 0) {
			this.commandService.addCommand({
				type: Command.Type.Move,
				id: Command.genId(),
				worldObjectId: currentMovementState.worldObjectId,
				path: currentMovementState.path.map(it => it.tile)
			})
		}
		this.gameStateWriter.setMovementState(null);
		this.gameStateWriter.setHighlightedTiles([])
	}

	cancelMovement(): void {
		this.gameStateWriter.setMovementState(null);
		this.gameStateWriter.setHighlightedTiles([])
	}

	addStep(tileId: Tile.Id): Promise<boolean> {
		const currentMovementState = this.localStateAccess.getCurrentMovementState();
		if (currentMovementState) {
			const target = currentMovementState.availableTargets.find(tgt => tgt.tile.id === tileId);
			if (target) {
				const newPath = [...currentMovementState.path, target];
				const newTotalCost = newPath.sum(0, it => it.cost);
				return this.getAvailableTargets(target.tile.id, currentMovementState.worldObjectId, newTotalCost)
					.then((availableTargets) => {
						this.gameStateWriter.setMovementState({
							worldObjectId: currentMovementState.worldObjectId,
							path: newPath,
							availableTargets: availableTargets,
						});
						this.gameStateWriter.setHighlightedTiles(availableTargets.map(it => it.tile.position))
					})
					.then(_ => true)
					.catch(_ => false)
			}
		}
		return Promise.resolve(false);
	}

	private getAvailableTargets(tileId: Tile.Id, worldObjectId: WorldObject.Id, points: number): Promise<MovementTarget[]> {
		try {
			return this.gameClient.getAvailableMovementPositions(worldObjectId, tileId, points);
		} catch (e) {
			return Promise.resolve([]);
		}
	}

}