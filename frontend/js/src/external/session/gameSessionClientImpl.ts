import {HttpClient} from "../../common/httpClient";
import {WebsocketClient} from "../../common/websocketClient";
import {GameResponse} from "../game/gameResponse";
import {GameSessionClient} from "../../logic/game/service/gameSessionClient";
import {GameMessageHandler} from "../../logic/game/service/gameMessageHandler";
import {GameStateMessage} from "./gameStateMessage";
import {GameStateMapper} from "./gameStateMapper";
import {Command} from "../../models/command/command";
import {CommandMessage} from "./commandMessage";
import {Game} from "../../models/misc/game";
import {authService} from "../../app/authentication/auth.service";

export class GameSessionClientImpl implements GameSessionClient {

	private readonly httpClient: HttpClient;
	private readonly wsClient: WebsocketClient;

	constructor(httpClient: HttpClient, wsClient: WebsocketClient) {
		this.httpClient = httpClient;
		this.wsClient = wsClient;
	}

	public list(): Promise<Game[]> {
		return this.httpClient
			.get<GameResponse[]>({
				url: "/api/session/list",
				requireAuth: true,
				token: authService.getAuthToken(),
			})
			.then(entries => entries.map(it => ({
				id: it.id as Game.Id,
				name: it.name,
				creationTimestamp: it.creationTimestamp,
				currentTurn: it.currentTurn,
			})));
	}

	public create(name: string, seed: string | null): Promise<string> {
		return this.httpClient.post<string>({
			url: "/api/session/create?name=" + name + (seed ? ("&seed=" + seed) : ""),
			requireAuth: true,
			token: authService.getAuthToken(),
			responseType: "text",
		});
	}

	public delete(game: Game.Id): Promise<void> {
		return this.httpClient.delete<void>({
			url: "/api/session/delete/" + game,
			requireAuth: true,
			token: authService.getAuthToken(),
		});
	}

	public join(game: Game.Id): Promise<void> {
		return this.httpClient.post<void>({
			url: `/api/session/join/${game}`,
			requireAuth: true,
			token: authService.getAuthToken(),
		});
	}

	public connect(game: Game.Id, handler: GameMessageHandler): Promise<void> {
		return this.getWebsocketTicket().then(ticket => {
			return this.wsClient.open(`/api/session/connect/${game}`, ticket, message => {
				console.debug("received message", message);
				this.handleMessage(message.type, message.payload, handler);
			});
		});
	}

	private handleMessage(type: string, payload: any, handler: GameMessageHandler) {
		if (type === "game-state") {
			const gameState = GameStateMapper.map(payload as GameStateMessage);
			handler.onGameState(gameState);
			return;
		}
		console.warn("Received message with unhandled type", type, payload);
	}

	public disconnect(): void {
		this.wsClient.close();
	}

	public submitTurn(commands: Command[]): void {
		this.sendMessage(
			"submit-turn",
			{
				commands: commands.map(cmd => CommandMessage.map(cmd)),
			},
		);
	}

	private sendMessage(type: string, payload: any): void {
		this.wsClient.send(type, payload);
	}

	private getWebsocketTicket(): Promise<string> {
		return this.httpClient.get<string>({
			url: "/api/session/wsticket",
			requireAuth: true,
			token: authService.getAuthToken(),
			responseType: "text",
		});
	}

}