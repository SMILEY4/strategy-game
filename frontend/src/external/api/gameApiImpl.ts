import {HttpClient} from "../../shared/httpClient";
import {WebsocketClient} from "../../shared/websocketClient";
import {MessageHandler} from "./messageHandler";
import {GameApi} from "../../core/required/gameApi";
import {GameConfig} from "../../core/models/gameConfig";
import {TilePosition} from "../../core/models/tilePosition";
import {CityCreationPreview} from "../../core/models/CityCreationPreview";
import {Command} from "../../core/models/command";
import {PayloadSubmitTurn} from "./models/payloadSubmitTurn";
import {AuthProvider} from "./clients/authProvider";

export class GameApiImpl implements GameApi {

    private readonly authProvider: AuthProvider;
    private readonly httpClient: HttpClient;
    private readonly wsClient: WebsocketClient;
    private readonly messageHandler: MessageHandler;


    constructor(authProvider: AuthProvider, httpClient: HttpClient, wsClient: WebsocketClient, messageHandler: MessageHandler) {
        this.authProvider = authProvider;
        this.httpClient = httpClient;
        this.wsClient = wsClient;
        this.messageHandler = messageHandler;
    }


    list(): Promise<string[]> {
        return this.httpClient.get<string[]>({
            url: "/api/session/list",
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    create(seed: string | null): Promise<string> {
        return this.httpClient.post<string>({
            url: "/api/session/create" + (seed ? ("?seed=" + seed) : ""),
            requireAuth: true,
            token: this.authProvider.getToken(),
            responseType: "text",
        });
    }

    delete(gameId: string): Promise<void> {
        return this.httpClient.delete<void>({
            url: "/api/session/delete/" + gameId,
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    join(gameId: string): Promise<void> {
        return this.httpClient.post<void>({
            url: `/api/session/join/${gameId}`,
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    connect(gameId: string): Promise<void> {
        return this.getWebsocketTicket().then(ticket => {
            return this.wsClient.open(`/api/session/${gameId}`, ticket, message => {
                this.messageHandler.onMessage(message.type, message.payload);
            });
        });
    }

    disconnect(): void {
        this.wsClient.close();
    }

    config(): Promise<GameConfig> {
        return this.httpClient.get<GameConfig>({
            url: "/api/session/config",
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    previewCityCreation(gameId: string, pos: TilePosition, isProvinceCapital: boolean): Promise<CityCreationPreview> {
        return this.httpClient.post<CityCreationPreview>({
            url: "/api/game/" + gameId + "/preview/city",
            body: {
                tile: {
                    q: pos.q,
                    r: pos.r,
                },
                isProvinceCapital: isProvinceCapital,
            },
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

    submitTurn(commands: Command[]): void {
        this.sendMessage("submit-turn", PayloadSubmitTurn.buildSubmitTurnPayload(commands));
    }


    private getWebsocketTicket(): Promise<string> {
        return this.httpClient.get<string>({
            url: "/api/session/wsticket",
            requireAuth: true,
            token: this.authProvider.getToken(),
            responseType: "text",
        });
    }

    private sendMessage(type: string, payload: any) {
        this.wsClient.send(type, payload);
    }

}