import {GameSessionClient} from "../client/gameSessionClient";
import {handleResponseError} from "../../../common/httpClient";
import {UnauthorizedError} from "../../../common/UnauthorizedError";
import {GameSessionMeta} from "../../../models/misc/gameSessionMeta";
import {RenderGraphPreloader} from "../../../renderer/game/renderGraphPreloader";
import {TurnStartService} from "./turnStartService";
import {GameStateMessage} from "../../../models/messages/gameStateMessage";
import {WebsocketMessageHandler} from "../../../common/websocketMessageHandler";
import {
	CreateSettlementCommandMessage,
	MoveCommandMessage,
	ProductionQueueAddCommandMessage,
	ProductionQueueCancelCommandMessage,
} from "../../../models/messages/commandMessage";
import {
	Command,
	CreateSettlementCommand,
	MoveCommand,
	ProductionQueueAddCommand,
	ProductionQueueCancelCommand,
} from "../../../models/command/command";
import {CommandType} from "../../../models/command/commandType";
import {GameStateAccess} from "../../../state/gameStateAccess";
import {GameStateWriter} from "../../../state/gameStateWriter";

export interface GameSessionService {
	listSessions(): Promise<GameSessionMeta[]>;
	createSession(name: string, seed: string | null): Promise<string>;
	joinSession(gameId: string): Promise<void>;
	deleteSession(gameId: string): Promise<void>;
	connectSession(gameId: string): Promise<void>;
	disconnectSession(): Promise<void>;
	submitTurn(commands: Command[]): void;
}

export class GameSessionServiceImpl implements WebsocketMessageHandler, GameSessionService {

	private readonly client: GameSessionClient;
	private readonly turnStartService: TurnStartService;
	private readonly localStateAccess: GameStateAccess;
	private readonly gameStateWriter: GameStateWriter;

	constructor(
		client: GameSessionClient,
		turnStartService: TurnStartService,
		localStateAccess: GameStateAccess,
		gameStateWriter: GameStateWriter,
	) {
		this.client = client;
		this.turnStartService = turnStartService;
		this.localStateAccess = localStateAccess;
		this.gameStateWriter = gameStateWriter;
	}


	/**
	 * Get all games of the currently logged-in user
	 */
	listSessions(): Promise<GameSessionMeta[]> {
		return this.client.list()
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	/**
	 * Create a new game with the given name and settings
	 */
	createSession(name: string, seed: string | null): Promise<string> {
		return this.client.create(name, seed)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	/**
	 * Join a game with the given id as a new player
	 */
	joinSession(gameId: string): Promise<void> {
		return this.client.join(gameId)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	/**
	 * Delete a game with the given id
	 */
	deleteSession(gameId: string): Promise<void> {
		return this.client.delete(gameId)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	/**
	 * Connect to the game with the given id and "start" playing
	 */
	connectSession(gameId: string): Promise<void> {
		return Promise.resolve()
			.then(() => this.gameStateWriter.setGameSessionState("loading"))
			.then(() => RenderGraphPreloader.tempLoad())
			.then(() => this.client.connect(gameId, this))
			.catch(e => {
				console.error(e);
				this.gameStateWriter.setGameSessionState("error");
			});
	}

	/**
	 * Disconnect from the current session
	 */
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
			this.gameStateWriter.setCurrentTurn(gameState.meta.turn);
			if (this.localStateAccess.getGameSessionState() === "loading") {
				this.gameStateWriter.setGameSessionState("playing");
			}
			this.gameStateWriter.setTurnState("playing");
			return;
		}
		console.log("Unknown and unhandled message: ", type);
	}


	/**
	 * Submit the commands for the current turn and end turn
	 */
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
								r: it.position.r
							})),
						};
						return cmdMsg;
					}

					if (it.type === CommandType.CREATE_SETTLEMENT) {
						const cmd = it as CreateSettlementCommand;
						const cmdMsg: CreateSettlementCommandMessage = {
							type: cmd.type.id,
							name: cmd.name,
							worldObjectId: cmd.worldObjectId!,
						};
						return cmdMsg;
					}

					if (it.type === CommandType.PRODUCTION_QUEUE_ADD) {
						const cmd = it as ProductionQueueAddCommand;
						const cmdMsg: ProductionQueueAddCommandMessage = {
							type: cmd.type.id,
							entryType: cmd.entry.type,
							settlementId: cmd.settlement.id,
						};
						return cmdMsg;
					}

					if (it.type === CommandType.PRODUCTION_QUEUE_CANCEL) {
						const cmd = it as ProductionQueueCancelCommand;
						const cmdMsg: ProductionQueueCancelCommandMessage = {
							type: cmd.type.id,
							entryId: cmd.entry.entryId,
							settlementId: cmd.settlement.id,
						};
						return cmdMsg;
					}

					throw new Error("Unexpected command type: " + it.type.id);
				}),
			},
		);
	}

}