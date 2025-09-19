import {GameStateAccess} from "../../../state/gameStateAccess";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {CommandService} from "./commandService";
import {GameClient} from "./gameClient";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {Tile} from "../../../models/tile/tile";
import {Command} from "../../../models/command/command";
import {TileService} from "./tileService";

export interface MovementService {
	/**
	 * Start "move" mode for the given world object
	 */
	beginMovement(worldObjectId: WorldObject.Id): void;
	/**
	 * End the movement and submit a command
	 */
	completeMovement(): void;
	/**
	 * End the movement without submitting a command
	 */
	cancelMovement(): void;
}

export class MovementServiceImpl implements MovementService {

	constructor(
		private readonly gameStateAccess: GameStateAccess,
		private readonly gameStateWriter: GameStateWriter,
		private readonly gameClient: GameClient,
		private readonly commandService: CommandService,
		private readonly tileService: TileService,
	) {
	}

	beginMovement(worldObjectId: WorldObject.Id): void {
		const worldObject = this.gameStateAccess.getWorldObjectSummary(worldObjectId);
		if (!worldObject) {
			return;
		}

		this.gameStateWriter.setMovementState({
			worldObjectId: worldObjectId,
			path: [worldObject.tile],
		});

		this.takeStep();
	}

	private takeStep() {
		const state = this.gameStateAccess.getCurrentMovementState();
		if (!state) {
			return;
		}
		const currentPathHead = state.path[state.path.length - 1];
		const currentPathCost = (state.path.length - 1);

		this.getAvailableTargets(currentPathHead.id, state.worldObjectId, currentPathCost).then(availableTargets => {
			this.tileService.selectTile(availableTargets)
				.then(selectedTilePosition => {
					if (selectedTilePosition) {
						this.gameStateWriter.setMovementState({
							worldObjectId: state.worldObjectId,
							path: [...state.path, selectedTilePosition],
						});
						this.takeStep();
					}
				});
		});
	}

	completeMovement(): void {
		const currentMovementState = this.gameStateAccess.getCurrentMovementState();
		if (currentMovementState && currentMovementState.path.length > 1) {
			this.commandService.addCommand({
				type: Command.Type.Move,
				id: Command.genId(),
				worldObjectId: currentMovementState.worldObjectId,
				path: currentMovementState.path,
			});
		}
		this.gameStateWriter.setMovementState(null);
		this.tileService.cancelTileSelection();
	}

	cancelMovement(): void {
		this.gameStateWriter.setMovementState(null);
		this.tileService.cancelTileSelection();
	}

	private getAvailableTargets(tileId: Tile.Id, worldObjectId: WorldObject.Id, points: number): Promise<Tile.Position[]> {
		try {
			return this.gameClient
				.getAvailableMovementPositions(worldObjectId, tileId, points)
				.then(targets => targets.map(it => it.tile.position));
		} catch (e) {
			return Promise.resolve([]);
		}
	}

}