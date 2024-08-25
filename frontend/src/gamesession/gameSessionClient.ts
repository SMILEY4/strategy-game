import {AuthProvider} from "../user/authProvider";
import {HttpClient} from "../shared/httpClient";
import {WebsocketClient} from "../shared/websocketClient";
import {GameSessionMeta} from "../models/primitives/gameSessionMeta";
import {WebsocketMessageHandler} from "../shared/websocketMessageHandler";

/**
 * API-Client for game session operations
 */
export class GameSessionClient {

    private readonly authProvider: AuthProvider;
    private readonly httpClient: HttpClient;
    private readonly wsClient: WebsocketClient;

    constructor(authProvider: AuthProvider, httpClient: HttpClient, wsClient: WebsocketClient) {
        this.authProvider = authProvider;
        this.httpClient = httpClient;
        this.wsClient = wsClient;
    }

    /**
     * List the games of the currently logged-in user
     */
    public list(): Promise<GameSessionMeta[]> {
        return this.httpClient.get<GameSessionMeta[]>({
            url: "/api/session/list",
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    /**
     * Create a new game with the given name and settings
     */
    public create(name: string, seed: string | null): Promise<string> {
        return this.httpClient.post<string>({
            url: "/api/session/create?name=" + name + (seed ? ("&seed=" + seed) : ""),
            requireAuth: true,
            token: this.authProvider.getToken(),
            responseType: "text",
        });
    }

    /**
     * Delete a game with the given id
     */
    public delete(gameId: string): Promise<void> {
        return this.httpClient.delete<void>({
            url: "/api/session/delete/" + gameId,
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    /**
     * Join a game with the given id as a new player
     */
    public join(gameId: string): Promise<void> {
        return this.httpClient.post<void>({
            url: `/api/session/join/${gameId}`,
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    /**
     * Connect to a given game and handle received messages
     */
    public connect(gameId: string, handler: WebsocketMessageHandler): Promise<void> {
        return this.getWebsocketTicket().then(ticket => {
            return this.wsClient.open(`/api/session/${gameId}`, ticket, message => {
                handler.onMessage(message.type, message.payload);
            });
        });
    }

    /**
     * Disconnect from a currently connected game
     */
    public disconnect(): void {
        this.wsClient.close();
    }

    /**
     * Send a message for the currently connected game
     * @param type
     * @param payload
     */
    public sendMessage(type: string, payload: any): void {
        this.wsClient.send(type, payload)
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