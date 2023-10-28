import {GameSessionClient} from "./gameSessionClient";
import {handleResponseError} from "../../shared/httpClient";
import {UnauthorizedError} from "../../models/UnauthorizedError";
import {GameSessionStateRepository} from "../../state/access/GameSessionStateRepository";
import {GameConfigRepository} from "../../state/access/GameConfigRepository";

export class GameSessionService {

    private readonly client: GameSessionClient;
    private readonly gameSessionRepository: GameSessionStateRepository;
    private readonly gameConfigRepository: GameConfigRepository;

    constructor(client: GameSessionClient, gameSessionRepository: GameSessionStateRepository, gameConfigRepository: GameConfigRepository) {
        this.client = client;
        this.gameSessionRepository = gameSessionRepository;
        this.gameConfigRepository = gameConfigRepository;
    }


    public listSessions(): Promise<string[]> {
        return this.client.list()
            .catch(error => handleResponseError(error, 401, () => {
                throw new UnauthorizedError();
            }));
    }

    public createSession(seed: string | null): Promise<string> {
        return this.client.create(seed)
            .catch(error => handleResponseError(error, 401, () => {
                throw new UnauthorizedError();
            }));
    }

    public joinSession(gameId: string): Promise<void> {
        return this.client.join(gameId)
            .catch(error => handleResponseError(error, 401, () => {
                throw new UnauthorizedError();
            }));
    }

    public deleteSession(gameId: string): Promise<void> {
        return this.client.delete(gameId)
            .catch(error => handleResponseError(error, 401, () => {
                throw new UnauthorizedError();
            }));
    }

    public connectSession(gameId: string): Promise<void> {
        return Promise.resolve()
            .then(() => this.gameSessionRepository.setGameSessionState("loading"))
            .then(() => this.client.config())
            .then(config => this.gameConfigRepository.setGameConfig(config))
            .then(() => this.client.connect(gameId))
            .then(() => this.gameSessionRepository.setGameSessionState("playing"))
            .catch(() => this.gameSessionRepository.setGameSessionState("error"));
    }

}