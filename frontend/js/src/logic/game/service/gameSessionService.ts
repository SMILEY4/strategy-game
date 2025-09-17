import {handleResponseError} from "../../../common/httpClient";
import {UnauthorizedError} from "../../../common/UnauthorizedError";
import {GameSessionData} from "../../../models/misc/gameSessionData";
import {Command} from "../../../models/command/command";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {CameraService} from "./cameraService";
import {GameSessionClient} from "./gameSessionClient";
import {GameMessageHandler} from "./gameMessageHandler";
import {GameState} from "../../../models/misc/gameState";

export interface GameSessionService {
	/**
	 * Get all games of the currently logged-in user
	 */
	listSessions(): Promise<GameSessionData[]>;
	/**
	 * Create a new game with the given name and settings
	 */
	createSession(name: string, seed: string | null): Promise<string>;
	/**
	 * Join a game with the given id as a new player
	 */
	joinSession(gameId: string): Promise<void>;
	/**
	 * Delete a game with the given id
	 */
	deleteSession(gameId: string): Promise<void>;
	/**
	 * Connect to the game with the given id and "start" playing
	 */
	connectSession(gameId: string): Promise<void>;
	/**
	 * Disconnect from the current session
	 */
	disconnectSession(): Promise<void>;
	/**
	 * Submit the commands for the current turn and end turn
	 */
	submitTurn(commands: Command[]): void;
}

export class GameSessionServiceImpl implements GameSessionService, GameMessageHandler {

	private readonly client: GameSessionClient;
	private readonly cameraService: CameraService;
	private readonly localStateAccess: GameStateAccess;
	private readonly gameStateWriter: GameStateWriter;

	constructor(
		client: GameSessionClient,
		cameraService: CameraService,
		localStateAccess: GameStateAccess,
		gameStateWriter: GameStateWriter,
	) {
		this.client = client;
		this.cameraService = cameraService;
		this.localStateAccess = localStateAccess;
		this.gameStateWriter = gameStateWriter;
	}


	listSessions(): Promise<GameSessionData[]> {
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

	joinSession(gameId: string): Promise<void> {
		return this.client.join(gameId)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	deleteSession(gameId: string): Promise<void> {
		return this.client.delete(gameId)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	connectSession(gameId: string): Promise<void> {
		return Promise.resolve()
			.then(() => this.gameStateWriter.setGameSessionState("loading"))
			.then(() => this.client.connect(gameId, this))
			.catch(e => {
				console.error(e);
				this.gameStateWriter.setGameSessionState("error");
			});
	}

	disconnectSession(): Promise<void> {
		return Promise.resolve()
			.then(() => this.gameStateWriter.setGameSessionState("none"))
			.then(() => this.client.disconnect())
			.catch(e => console.error(e));
	}

	submitTurn(commands: Command[]) {
		this.client.submitTurn(commands);
	}

	onGameState(gameState: GameState): void {
		this.gameStateWriter.replaceGameState(gameState);
		this.gameStateWriter.setCurrentTurn(gameState.turn);
		if (this.localStateAccess.getGameSessionState() === "loading") {
			this.gameStateWriter.setGameSessionState("playing");
			this.cameraService.centerOnTile(this.localStateAccess.getSpawnTile().position, 15);
		}
		this.gameStateWriter.setTurnState("playing");
	}

}