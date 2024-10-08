import {GameSessionClient} from "./gameSessionClient";
import {handleResponseError} from "../shared/httpClient";
import {UnauthorizedError} from "../models/common/UnauthorizedError";
import {GameSessionMeta} from "../models/primitives/gameSessionMeta";
import {RenderGraphPreloader} from "../renderer/core/graph/renderGraphPreloader";
import {GameSessionRepository} from "./gameSessionRepository";
import {TurnStartService} from "../game/turnStartService";
import {GameStateMessage} from "./models/gameStateMessage";
import {WebsocketMessageHandler} from "../shared/websocketMessageHandler";
import {
	Command,
	CommandType,
	CreateSettlementDirectCommand,
	CreateSettlementWithSettlerCommand,
	MoveCommand, ProductionQueueAddCommand, ProductionQueueCancelCommand,
} from "../models/primitives/command";
import {
	CreateSettlementDirectCommandMessage,
	CreateSettlementWithSettlerCommandMessage,
	MoveCommandMessage, ProductionQueueAddCommandMessage, ProductionQueueCancelCommandMessage,
} from "./models/commandMessage";

/**
 * Game session service logic
 */
export class GameSessionService implements WebsocketMessageHandler {

	private readonly client: GameSessionClient;
	private readonly repository: GameSessionRepository;
	private readonly turnStartService: TurnStartService;

	constructor(client: GameSessionClient, gameSessionRepository: GameSessionRepository, turnStartService: TurnStartService) {
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
			.catch(() => this.repository.setSessionState("error"));
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

					if (it.type === CommandType.CREATE_SETTLEMENT_DIRECT) {
						const cmd = it as CreateSettlementDirectCommand;
						const cmdMsg: CreateSettlementDirectCommandMessage = {
							type: cmd.type.id,
							name: cmd.name,
							tile: cmd.tile
						};
						return cmdMsg;
					}

					if (it.type === CommandType.CREATE_SETTLEMENT_WITH_SETTLER) {
						const cmd = it as CreateSettlementWithSettlerCommand;
						const cmdMsg: CreateSettlementWithSettlerCommandMessage = {
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
							settlementId: cmd.settlement.id,
						};
						return cmdMsg;
					}

					if (it.type === CommandType.PRODUCTION_QUEUE_CANCEL) {
						const cmd = it as ProductionQueueCancelCommand;
						const cmdMsg: ProductionQueueCancelCommandMessage = {
							type: cmd.type.id,
							entryId: cmd.entry.id,
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