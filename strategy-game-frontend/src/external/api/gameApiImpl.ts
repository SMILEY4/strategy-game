import {Command} from "../../core/models/command";
import {GameConfig} from "../../core/models/gameConfig";
import {GameApi} from "../../core/required/gameApi";
import {UserRepository} from "../../core/required/userRepository";
import {HttpClient} from "./http/httpClient";
import {MessageHandler} from "./messageHandler";
import {WebsocketClient} from "./messaging/websocketClient";
import {PayloadSubmitTurn} from "./models/payloadSubmitTurn";

export class GameApiImpl implements GameApi {

    private readonly httpClient: HttpClient;
    private readonly websocketClient: WebsocketClient;
    private readonly messageHandler: MessageHandler;
    private readonly userRepository: UserRepository;


    constructor(httpClient: HttpClient, websocketClient: WebsocketClient, messageHandler: MessageHandler, userRepository: UserRepository) {
        this.httpClient = httpClient;
        this.websocketClient = websocketClient;
        this.messageHandler = messageHandler;
        this.userRepository = userRepository;
    }


    config(): Promise<GameConfig> {
        return Promise.resolve()
            .then(() => this.httpClient.get({
                url: "/api/game/config",
                requireAuth: true,
                token: this.userRepository.getAuthToken()
            }))
            .then(response => response.json());
    }


    list(): Promise<string[]> {
        return Promise.resolve()
            .then(() => this.httpClient.get({
                url: "/api/game/list",
                requireAuth: true,
                token: this.userRepository.getAuthToken()
            }))
            .then(response => response.json());
    }


    create(): Promise<string> {
        return Promise.resolve()
            .then(() => this.httpClient.post({
                url: "/api/game/create",
                requireAuth: true,
                token: this.userRepository.getAuthToken()
            }))
            .then(response => response.text());
    }


    join(gameId: string): Promise<void> {
        return Promise.resolve()
            .then(() => this.httpClient.post({
                url: `/api/game/join/${gameId}`,
                requireAuth: true,
                token: this.userRepository.getAuthToken()
            }))
            .then(() => undefined);
    }


    connect(gameId: string): Promise<void> {
        const url = `/api/game/${gameId}?token=${this.userRepository.getAuthToken()}`;
        console.log("open websocket-connection:", url);
        return this.websocketClient.open(url, message => {
            this.messageHandler.onMessage(message.type, message.payload);
        });
    }


    disconnect(): void {
        this.websocketClient.close();
    }


    submitTurn(commands: Command[]): void {
        this.websocketClient.send("submit-turn", PayloadSubmitTurn.buildSubmitTurnPayload(commands));
    }

}