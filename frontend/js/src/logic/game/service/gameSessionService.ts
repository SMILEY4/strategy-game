import {GameSessionClient} from "../client/gameSessionClient";
import {handleResponseError} from "../../../common/httpClient";
import {UnauthorizedError} from "../../../common/UnauthorizedError";
import {GameSessionMeta} from "../../../models/misc/gameSessionMeta";
import {TurnStartService} from "./turnStartService";
import {GameStateMessage} from "../../../models/messages/gameStateMessage";
import {WebsocketMessageHandler} from "../../../common/websocketMessageHandler";
import {
	MoveCommandMessage,
} from "../../../models/messages/commandMessage";
import {
	Command,
	MoveCommand,
} from "../../../models/command/command";
import {CommandType} from "../../../models/command/commandType";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {CameraService} from "./cameraService";

export interface GameSessionService {
	/**
	 * Get all games of the currently logged-in user
	 */
	listSessions(): Promise<GameSessionMeta[]>;
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

export class GameSessionServiceImpl implements WebsocketMessageHandler, GameSessionService {

	private readonly client: GameSessionClient;
	private readonly turnStartService: TurnStartService;
	private readonly cameraService: CameraService;
	private readonly localStateAccess: GameStateAccess;
	private readonly gameStateWriter: GameStateWriter;

	constructor(
		client: GameSessionClient,
		turnStartService: TurnStartService,
		cameraService: CameraService,
		localStateAccess: GameStateAccess,
		gameStateWriter: GameStateWriter,
	) {
		this.client = client;
		this.turnStartService = turnStartService;
		this.cameraService = cameraService;
		this.localStateAccess = localStateAccess;
		this.gameStateWriter = gameStateWriter;
	}


	listSessions(): Promise<GameSessionMeta[]> {
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

	onMessage(type: string, payload: any): void {
		console.log("received message", type, payload);
		if (type === "game-state") {
			const gameState = payload as GameStateMessage;
			this.turnStartService.setGameState(gameState);
			this.gameStateWriter.setCurrentTurn(gameState.game.turn);
			if (this.localStateAccess.getGameSessionState() === "loading") {
				this.gameStateWriter.setGameSessionState("playing");
				this.cameraService.centerOnTile(this.localStateAccess.getSpawnTile().position, 15)
			}
			this.gameStateWriter.setTurnState("playing");
			return;
		}
		console.log("Unknown and unhandled message: ", type);
	}


	submitTurn(commands: Command[]) {
		this.client.sendMessage(
			"submit-turn",
			{
				commands: commands.map(it => {
					if (it.type === CommandType.MOVE) {
						const cmd = it as MoveCommand;
						const cmdMsg: MoveCommandMessage = {
							type: cmd.type.id,
							worldObjectId: cmd.worldObjectId!,
							path: cmd.path.map(it => ({
								id: it.id,
								q: it.position.q,
								r: it.position.r,
							})),
						};
						return cmdMsg;
					}
					throw new Error("Unexpected command type: " + it.type.id);
				}),
			},
		);
	}

}