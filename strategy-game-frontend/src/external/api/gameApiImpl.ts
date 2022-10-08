import {GameApi} from "../../core/required/gameApi";
import {UserRepository} from "../../core/required/userRepository";
import {Command, CommandCreateCity, CommandPlaceMarker, CommandPlaceScout} from "../../models/state/command";
import {GameConfig} from "../../models/state/gameConfig";
import {HttpClient} from "./http/httpClient";
import {MessageHandler} from "./messageHandler";
import {WebsocketClient} from "./messaging/websocketClient";

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
        return this.httpClient
            .get({
                url: "/api/game/config",
                requireAuth: true,
                token: this.userRepository.getAuthToken()
            })
            .then(response => response.json());
    }


    list(): Promise<string[]> {
        return this.httpClient
            .get({
                url: "/api/game/list",
                requireAuth: true,
                token: this.userRepository.getAuthToken()
            })
            .then(response => response.json());
    }


    create(): Promise<string> {
        return this.httpClient
            .post({
                url: "/api/game/create",
                requireAuth: true,
                token: this.userRepository.getAuthToken()
            })
            .then(response => response.text());
    }


    join(gameId: string): Promise<void> {
        return this.httpClient
            .post({
                url: `/api/game/join/${gameId}`,
                requireAuth: true,
                token: this.userRepository.getAuthToken()
            })
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
        this.websocketClient.send("submit-turn", {
                commands: commands.map(cmd => {
                    if (cmd.commandType === "place-marker") {
                        const cmdPlaceMarker = cmd as CommandPlaceMarker;
                        return {
                            type: "place-marker",
                            q: cmdPlaceMarker.q,
                            r: cmdPlaceMarker.r,
                        };
                    }
                    if (cmd.commandType === "place-scout") {
                        const cmdPlaceScout = cmd as CommandPlaceScout;
                        return {
                            type: "place-scout",
                            q: cmdPlaceScout.q,
                            r: cmdPlaceScout.r,
                        };
                    }
                    if (cmd.commandType === "create-city") {
                        const cmdCreateCity = cmd as CommandCreateCity;
                        return {
                            type: "create-city",
                            name: cmdCreateCity.name,
                            q: cmdCreateCity.q,
                            r: cmdCreateCity.r,
                            parentCity: cmdCreateCity.parentCity
                        };
                    }
                    return undefined;
                })
            }
        );
    }

}