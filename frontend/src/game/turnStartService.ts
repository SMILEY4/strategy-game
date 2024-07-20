import {GameStateMessage} from "./models/gameStateMessage";
import {ValueHistory} from "../shared/valueHistory";
import {MonitoringRepository} from "../state/database/monitoringRepository";
import {Tile} from "../models/tile";
import {GameRepository} from "./gameRepository";

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
				this.gameRepository.replaceTiles(this.buildTiles(gameState));
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
		return game.tiles.map(tileMsg => ({identifier: tileMsg.identifier}));
	}

}