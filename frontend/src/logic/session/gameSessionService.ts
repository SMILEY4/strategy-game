import {GameSessionClient} from "./gameSessionClient";
import {handleResponseError} from "../../common/httpClient";
import {UnauthorizedError} from "../../common/UnauthorizedError";
import {GameSessionMeta} from "../../models/base/gameSessionMeta";
import {RenderGraphPreloader} from "../../renderer/game/renderGraphPreloader";
import {SessionRepository} from "../../state/repository/sessionRepository";
import {TurnStartService} from "../game/turnStartService";
import {GameStateMessage} from "./models/gameStateMessage";
import {WebsocketMessageHandler} from "../../common/websocketMessageHandler";
import {
	Command,
	CommandType,
	CreateSettlement,
	MoveCommand, ProductionQueueAddCommand, ProductionQueueCancelCommand,
} from "../../models/base/command";
import {
	CreateSettlementCommandMessage,
	MoveCommandMessage, ProductionQueueAddCommandMessage, ProductionQueueCancelCommandMessage,
} from "./models/commandMessage";

/**
 * Game session service logic
 */
export class GameSessionService implements WebsocketMessageHandler {

	private readonly client: GameSessionClient;
	private readonly repository: SessionRepository;
	private readonly turnStartService: TurnStartService;

	constructor(client: GameSessionClient, gameSessionRepository: SessionRepository, turnStartService: TurnStartService) {
		this.client = client;
		this.repository = gameSessionRepository;
		this.turnStartService = turnStartService;
	}


	/**
	 * Get all games of the currently logged-in user
	 */
	public listSessions(): Promise<GameSessionMeta[]> {
		return this.client.list()
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	/**
	 * Create a new game with the given name and settings
	 */
	public createSession(name: string, seed: string | null): Promise<string> {
		return this.client.create(name, seed)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	/**
	 * Join a game with the given id as a new player
	 */
	public joinSession(gameId: string): Promise<void> {
		return this.client.join(gameId)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	/**
	 * Delete a game with the given id
	 */
	public deleteSession(gameId: string): Promise<void> {
		return this.client.delete(gameId)
			.catch(error => handleResponseError(error, 401, () => {
				throw new UnauthorizedError();
			}));
	}

	/**
	 * Connect to the game with the given id and "start" playing
	 */
	public connectSession(gameId: string): Promise<void> {
		return Promise.resolve()
			.then(() => this.repository.setSessionState("loading"))
			.then(() => RenderGraphPreloader.tempLoad())
			.then(() => this.client.connect(gameId, this))
			.catch(e => {
				console.error(e)
				this.repository.setSessionState("error")
			});
	}

	/**
	 * Disconnect from the current session
	 */
	public disconnectSession(): Promise<void> {
		return Promise.resolve()
			.then(() => this.repository.setSessionState("none"))
			.then(() => this.client.disconnect())
			.catch(e => console.error(e))
	}

	public onMessage(type: string, payload: any): void {
		console.log("received message", type, payload);
		if (type === "game-state") {
			const gameState = payload as GameStateMessage;
			this.turnStartService.setGameState(gameState);
			this.repository.setTurn(gameState.meta.turn);
			if (this.repository.getSessionState() === "loading") {
				this.repository.setSessionState("playing");
			}
			this.repository.setTurnState("playing");
			return;
		}
		console.log("Unknown and unhandled message: ", type);
	}


	/**
	 * Submit the commands for the current turn and end turn
	 */
	public submitTurn(commands: Command[]) {
		this.client.sendMessage(
			"submit-turn",
			{
				commands: commands.map(it => {

					if (it.type === CommandType.MOVE) {
						const cmd = it as MoveCommand;
						const cmdMsg: MoveCommandMessage = {
							type: cmd.type.id,
							worldObjectId: cmd.worldObjectId!,
							path: cmd.path,
						};
						return cmdMsg;
					}

					if (it.type === CommandType.CREATE_SETTLEMENT) {
						const cmd = it as CreateSettlement;
						const cmdMsg: CreateSettlementCommandMessage = {
							type: cmd.type.id,
							name: cmd.name,
							worldObjectId: cmd.worldObjectId!
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
							settlementId: cmd.settlement.id
						};
						return cmdMsg;
					}

					throw new Error("Unexpected command type: " + it.type.id)
				}),
			},
		);
	}

}