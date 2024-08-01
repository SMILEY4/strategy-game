import {GameStateMessage} from "../gamesession/models/gameStateMessage";
import {ValueHistory} from "../shared/valueHistory";
import {MonitoringRepository} from "../state/database/monitoringRepository";
import {Tile} from "../models/tile";
import {GameRepository} from "./gameRepository";
import {TerrainType} from "../models/TerrainType";
import {TileResourceType} from "../models/TileResourceType";
import {WorldObjectType} from "../models/worldObjectType";
import {MovementModeState} from "../state/movementModeState";
import {WorldObject} from "../models/worldObject";

/**
 * Service to handle the start of a new turn
 */
export class TurnStartService {

	private readonly gameRepository: GameRepository;
	private readonly monitoringRepository: MonitoringRepository;
	private readonly durationHistory = new ValueHistory(10);

	constructor(
		gameRepository: GameRepository,
		monitoringRepository: MonitoringRepository,
	) {
		this.gameRepository = gameRepository;
		this.monitoringRepository = monitoringRepository;
	}

	/**
	 * Initialize/Set the current game state data for the start of a new turn.
	 */
	public setGameState(gameState: GameStateMessage) {
		this.monitorSetGameState(() => {

			this.gameRepository.transactionForStartTurn(() => {
				this.gameRepository.clearCommands()
				this.gameRepository.replaceTiles(this.buildTiles(gameState));
				this.gameRepository.replaceWorldObjects(this.buildWorldObjects(gameState))
			});

		});
	}

	private monitorSetGameState(action: () => void) {
		const timeStart = Date.now();

		action();

		const timeEnd = Date.now();
		this.durationHistory.set(timeEnd - timeStart);
		this.monitoringRepository.setNextTurnDurations(this.durationHistory.getHistory());
	}

	private buildTiles(game: GameStateMessage): Tile[] {
		return game.tiles.map(tileMsg => ({
			identifier: tileMsg.identifier,
			terrainType: TerrainType.fromString(tileMsg.terrainType),
			resourceType: TileResourceType.fromString(tileMsg.resourceType),
			height: tileMsg.height,
		}));
	}

	private buildWorldObjects(game: GameStateMessage): WorldObject[] {
		return game.worldObjects.map(worldObjMsg => {
			if(worldObjMsg.type === "scout") {
				return {
					id: worldObjMsg.id,
					type: WorldObjectType.SCOUT,
					tile: worldObjMsg.tile,
					movementPoints: 5
				}
			}
			return null
		}).filterDefined()
	}

}