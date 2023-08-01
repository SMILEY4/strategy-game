import {Command} from "../../core/models/command";
import {GameConfig} from "../../core/models/gameConfig";
import {GameApi, GameNotFoundError, UnauthorizedError, UserAlreadyPlayerError} from "../../core/required/gameApi";
import {UserRepository} from "../../core/required/userRepository";
import {HttpClient} from "./http/httpClient";
import {MessageHandler} from "./messageHandler";
import {WebsocketClient} from "./messaging/websocketClient";
import {PayloadSubmitTurn} from "./models/payloadSubmitTurn";
import {ResponseUtils} from "./http/responseUtils";
import {UnexpectedError} from "../../shared/error";
import {CityCreationPreview} from "../../core/models/CityCreationPreview";
import {TilePosition} from "../../core/models/tilePosition";
import handleErrorResponses = ResponseUtils.handleErrorResponses;

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
                url: "/api/session/config",
                requireAuth: true,
                token: this.userRepository.getAuthToken(),
            }))
            .then(response => handleErrorResponses(response, error => {
                if (error.status === "Unauthorized") return new UnauthorizedError();
                return new UnexpectedError(error.status);
            }))
            .then(response => response.json());
    }


    list(): Promise<string[]> {
        return Promise.resolve()
            .then(() => this.httpClient.get({
                url: "/api/session/list",
                requireAuth: true,
                token: this.userRepository.getAuthToken(),
            }))
            .then(response => handleErrorResponses(response, error => {
                if (error.status === "Unauthorized") return new UnauthorizedError();
                return new UnexpectedError(error.status);
            }))
            .then(response => response.json());
    }


    create(seed: string | null): Promise<string> {
        return Promise.resolve()
            .then(() => this.httpClient.post({
                url: "/api/session/create" + (seed ? ("?seed=" + seed) : ""),
                requireAuth: true,
                token: this.userRepository.getAuthToken(),
            }))
            .then(response => handleErrorResponses(response, error => {
                if (error.status === "Unauthorized") return new UnauthorizedError();
                if (error.status === "GameNotFoundError") return new GameNotFoundError();
                if (error.status === "UserAlreadyPlayerError") return new UserAlreadyPlayerError();
                return new UnexpectedError(error.status);
            }))
            .then(response => response.text());
    }


    join(gameId: string): Promise<void> {
        return Promise.resolve()
            .then(() => this.httpClient.post({
                url: `/api/session/join/${gameId}`,
                requireAuth: true,
                token: this.userRepository.getAuthToken(),
            }))
            .then(response => handleErrorResponses(response, error => {
                if (error.status === "Unauthorized") return new UnauthorizedError();
                if (error.status === "GameNotFoundError") return new GameNotFoundError();
                if (error.status === "UserAlreadyPlayerError") return new UserAlreadyPlayerError();
                return new UnexpectedError(error.status);
            }))
            .then(() => undefined);
    }


    connect(gameId: string): Promise<void> {
        const url = `/api/session/${gameId}`;
        console.log("open websocket-connection:", url);
        return this.websocketClient.open(url, this.userRepository.getAuthToken(), message => {
            this.messageHandler.onMessage(message.type, message.payload);
        });
    }


    disconnect(): void {
        this.websocketClient.close();
    }


    submitTurn(commands: Command[]): void {
        this.websocketClient.send("submit-turn", PayloadSubmitTurn.buildSubmitTurnPayload(commands));
    }

    previewCityCreation(gameId: string, pos: TilePosition, isProvinceCapital: boolean): Promise<CityCreationPreview> {
        return Promise.resolve()
            .then(() => this.httpClient.post({
                url: "/api/game/" + gameId + "/preview/city",
                body: {
                    tile: {
                        q: pos.q,
                        r: pos.r,
                    },
                    isProvinceCapital: isProvinceCapital,
                },
                requireAuth: true,
                token: this.userRepository.getAuthToken(),
            }))
            .then(response => handleErrorResponses(response, error => {
                if (error.status === "Unauthorized") return new UnauthorizedError();
                return new UnexpectedError(error.status);
            }))
            .then(response => response.json())
            .then(data => ({
                position: pos,
                isProvinceCapital: isProvinceCapital,
                addedRoutes: data.addedRoutes,
                claimedTiles: data.claimedTiles,
            }));
    }

}