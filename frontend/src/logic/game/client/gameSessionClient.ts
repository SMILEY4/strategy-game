import {HttpClient} from "../../../common/httpClient";
import {WebsocketClient} from "../../../common/websocketClient";
import {GameSessionMeta} from "../../../models/misc/gameSessionMeta";
import {WebsocketMessageHandler} from "../../../common/websocketMessageHandler";
import {UserStateAccess} from "../../../state/userStateAccess";

/**
 * API-Client for game session operations
 */
export class GameSessionClient {

    private readonly userStateAccess: UserStateAccess;
    private readonly httpClient: HttpClient;
    private readonly wsClient: WebsocketClient;

    constructor(httpClient: HttpClient, wsClient: WebsocketClient, userStateAccess: UserStateAccess) {
        this.userStateAccess = userStateAccess;
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
            token: this.userStateAccess.getAuthTokenOrNull(),
        });
    }

    /**
     * Create a new game with the given name and settings
     */
    public create(name: string, seed: string | null): Promise<string> {
        return this.httpClient.post<string>({
            url: "/api/session/create?name=" + name + (seed ? ("&seed=" + seed) : ""),
            requireAuth: true,
            token: this.userStateAccess.getAuthTokenOrNull(),
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
            token: this.userStateAccess.getAuthTokenOrNull(),
        });
    }

    /**
     * Join a game with the given id as a new player
     */
    public join(gameId: string): Promise<void> {
        return this.httpClient.post<void>({
            url: `/api/session/join/${gameId}`,
            requireAuth: true,
            token: this.userStateAccess.getAuthTokenOrNull(),
        });
    }

    /**
     * Connect to a given game and handle received messages
     */
    public connect(gameId: string, handler: WebsocketMessageHandler): Promise<void> {
        return this.getWebsocketTicket().then(ticket => {
            return this.wsClient.open(`/api/session/connect/${gameId}`, ticket, message => {
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
            token: this.userStateAccess.getAuthTokenOrNull(),
            responseType: "text",
        });
    }

}