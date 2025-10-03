import {handleResponseError} from "../../../common/httpClient";
import {UnauthorizedError} from "../../../common/UnauthorizedError";
import {Game} from "../../../models/misc/game";
import {Command} from "../../../models/command/command";
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
	 * Get all games of the currently logged-in user
	 */
	listSessions(): Promise<Game[]>;
	/**
	 * Create a new game with the given name and settings
	 */
	createSession(name: string, seed: string | null): Promise<string>;
	/**
	 * Join a game with the given id as a new player
	 */
	joinSession(gameId: Game.Id): Promise<void>;
	/**
	 * Delete a game with the given id
	 */
	deleteSession(gameId: Game.Id): Promise<void>;
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


	listSessions(): Promise<Game[]> {
		return this.client.list()
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	createSession(name: string, seed: string | null): Promise<string> {
		return this.client.create(name, seed)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	joinSession(gameId: Game.Id): Promise<void> {
		return this.client.join(gameId)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	deleteSession(gameId: Game.Id): Promise<void> {
		return this.client.delete(gameId)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
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