import {Game} from "../../../models/misc/game";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {CameraService} from "./cameraService";
import {GameSessionClient} from "./gameSessionClient";
import {GameMessageHandler} from "./gameMessageHandler";
import {GameStateContainer} from "../../../models/misc/gameStateContainer";
import {GameSession} from "../../../models/misc/gameSession";
import {InteractionService} from "./interactionService";

export interface GameSessionService {
	/**
	 * Connect to the game with the given id and "start" playing
	 */
	connectSession(gameId: Game.Id): Promise<void>;
	/**
	 * Disconnect from the current session
	 */
	disconnectSession(): Promise<void>;
	/**
	 * Submit the current commands for the current turn and end turn
	 */
	endTurn(): void;
}

export class GameSessionServiceImpl implements GameSessionService, GameMessageHandler {

	constructor(
		private readonly client: GameSessionClient,
		private readonly cameraService: CameraService,
		private readonly gameStateAccess: GameStateAccess,
		private readonly gameStateWriter: GameStateWriter,
        private readonly interactionService: InteractionService,
	) {
	}

	connectSession(gameId: Game.Id): Promise<void> {
		return Promise.resolve()
			.then(() => this.gameStateWriter.setGameSessionState(GameSession.SessionState.Loading))
			.then(() => this.client.connect(gameId, this))
			.catch(e => {
				console.error(e);
				this.gameStateWriter.setGameSessionState(GameSession.SessionState.Error);
			});
	}

	disconnectSession(): Promise<void> {
		return Promise.resolve()
			.then(() => this.gameStateWriter.setGameSessionState(GameSession.SessionState.None))
			.then(() => this.client.disconnect())
			.catch(e => console.error(e));
	}

	endTurn() {
        this.interactionService.endInteraction()
        this.client.submitTurn(this.gameStateAccess.getCommands());
        this.gameStateWriter.clearCommands();
        this.gameStateWriter.setTurnState(GameSession.TurnState.Waiting)
	}

	onGameState(gameState: GameStateContainer): void {
        this.interactionService.endInteraction()
        this.gameStateWriter.replaceGameState(gameState);
		this.gameStateWriter.setCurrentTurn(gameState.turn);
		if (this.gameStateAccess.getGameSessionState() === GameSession.SessionState.Loading) {
			this.gameStateWriter.setGameSessionState(GameSession.SessionState.Playing);
			this.cameraService.centerOnTile(this.gameStateAccess.getSpawnTile().position, 15);
		}
		this.gameStateWriter.setTurnState(GameSession.TurnState.Playing);
	}

}