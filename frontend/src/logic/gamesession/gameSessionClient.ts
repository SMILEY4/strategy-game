import {AuthProvider} from "../user/authProvider";
import {HttpClient} from "../../shared/httpClient";
import {WebsocketClient} from "../../shared/websocketClient";
import {WebsocketMessageHandler} from "../../shared/websocketMessageHandler";
import {GameConfig} from "../../models/gameConfig";
import {GameSessionMeta} from "../../models/gameSessionMeta";

export class GameSessionClient {

    private readonly authProvider: AuthProvider;
    private readonly httpClient: HttpClient;
    private readonly wsClient: WebsocketClient;
    private readonly messageHandler: WebsocketMessageHandler;

    constructor(authProvider: AuthProvider, httpClient: HttpClient, wsClient: WebsocketClient, messageHandler: WebsocketMessageHandler) {
        this.authProvider = authProvider;
        this.httpClient = httpClient;
        this.wsClient = wsClient;
        this.messageHandler = messageHandler;
    }

    public list(): Promise<GameSessionMeta[]> {
        return this.httpClient.get<GameSessionMeta[]>({
            url: "/api/session/list",
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    public create(name: string, seed: string | null): Promise<string> {
        return this.httpClient.post<string>({
            url: "/api/session/create?name=" + name + (seed ? ("&seed=" + seed) : ""),
            requireAuth: true,
            token: this.authProvider.getToken(),
            responseType: "text",
        });
    }

    public delete(gameId: string): Promise<void> {
        return this.httpClient.delete<void>({
            url: "/api/session/delete/" + gameId,
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    public join(gameId: string): Promise<void> {
        return this.httpClient.post<void>({
            url: `/api/session/join/${gameId}`,
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    public connect(gameId: string): Promise<void> {
        return this.getWebsocketTicket().then(ticket => {
            return this.wsClient.open(`/api/session/${gameId}`, ticket, message => {
                this.messageHandler.onMessage(message.type, message.payload);
            });
        });
    }

    public disconnect(): void {
        this.wsClient.close();
    }

    public sendMessage(type: string, payload: any): void {
        this.wsClient.send(type, payload)
    }

    public config(): Promise<GameConfig> {
        return this.httpClient.get<GameConfig>({
            url: "/api/session/config",
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    private getWebsocketTicket(): Promise<string> {
        return this.httpClient.get<string>({
            url: "/api/session/wsticket",
            requireAuth: true,
            token: this.authProvider.getToken(),
            responseType: "text",
        });
    }

}