import {HttpClient} from "../../common/httpClient";
import {WebsocketClient} from "../../common/websocketClient";
import {UserStateAccess} from "../../state/userStateAccess";
import {GameResponse} from "../game/gameResponse";
import {GameSessionClient} from "../../logic/game/service/gameSessionClient";
import {GameMessageHandler} from "../../logic/game/service/gameMessageHandler";
import {GameStateMessage} from "./gameStateMessage";
import {GameStateMapper} from "./gameStateMapper";
import {Command, DisbandCommand, MoveCommand} from "../../models/command/command";
import {CommandType} from "../../models/command/commandType";
import {DisbandWorldObjectCommandMessage, MoveCommandMessage} from "./commandMessage";

export class GameSessionClientImpl implements GameSessionClient {

	private readonly userStateAccess: UserStateAccess;
	private readonly httpClient: HttpClient;
	private readonly wsClient: WebsocketClient;

	constructor(httpClient: HttpClient, wsClient: WebsocketClient, userStateAccess: UserStateAccess) {
		this.userStateAccess = userStateAccess;
		this.httpClient = httpClient;
		this.wsClient = wsClient;
	}

    public list(): Promise<GameResponse[]> {
        return this.httpClient.get<GameResponse[]>({
            url: "/api/session/list",
            requireAuth: true,
            token: this.userStateAccess.getAuthTokenOrNull(),
        });
    }

    public create(name: string, seed: string | null): Promise<string> {
        return this.httpClient.post<string>({
            url: "/api/session/create?name=" + name + (seed ? ("&seed=" + seed) : ""),
            requireAuth: true,
            token: this.userStateAccess.getAuthTokenOrNull(),
            responseType: "text",
        });
    }

    public delete(gameId: string): Promise<void> {
        return this.httpClient.delete<void>({
            url: "/api/session/delete/" + gameId,
            requireAuth: true,
            token: this.userStateAccess.getAuthTokenOrNull(),
        });
    }

    public join(gameId: string): Promise<void> {
        return this.httpClient.post<void>({
            url: `/api/session/join/${gameId}`,
            requireAuth: true,
            token: this.userStateAccess.getAuthTokenOrNull(),
        });
    }

    public connect(gameId: string, handler: GameMessageHandler): Promise<void> {
        return this.getWebsocketTicket().then(ticket => {
            return this.wsClient.open(`/api/session/connect/${gameId}`, ticket, message => {
                this.handleMessage(message.type, message.payload, handler);
            });
        });
    }

	private handleMessage(type: string, payload: any, handler: GameMessageHandler) {
		if(type === "game-state") {
			const gameState = GameStateMapper.map(payload as GameStateMessage);
			handler.onGameState(gameState)
			return
		}
		console.warn("Received message with unhandled type", type, payload)
	}

    public disconnect(): void {
        this.wsClient.close();
    }

	public submitTurn(commands: Command[]): void {
		const commandsMessage = commands.map(it => {
			if (it.type === CommandType.WORLD_OBJECT_MOVE) {
				const cmd = it as MoveCommand;
				const cmdMsg: MoveCommandMessage = {
					type: cmd.type.id,
					worldObjectId: cmd.worldObjectId!,
					path: cmd.path.map(it => ({
						id: it.id,
						position: {
							q: it.position.q,
							r: it.position.r,
						}
					})),
				};
				return cmdMsg;
			}
			if (it.type === CommandType.WORLD_OBJECT_DISBAND) {
				const cmd = it as DisbandCommand;
				const cmdMsg: DisbandWorldObjectCommandMessage = {
					type: cmd.type.id,
					worldObjectId: cmd.worldObjectId!,
				};
				return cmdMsg;
			}
			throw new Error("Unexpected command type: " + it.type.id);
		})
		this.sendMessage("submit-turn", { commands: commandsMessage });
	}

    private sendMessage(type: string, payload: any): void {
        this.wsClient.send(type, payload)
    }

    private getWebsocketTicket(): Promise<string> {
        return this.httpClient.get<string>({
            url: "/api/session/wsticket",
            requireAuth: true,
            token: this.userStateAccess.getAuthTokenOrNull(),
            responseType: "text",
        });
    }

}