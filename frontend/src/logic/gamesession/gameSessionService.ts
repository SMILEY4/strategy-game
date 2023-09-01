import {GameSessionClient} from "./gameSessionClient";
import {handleResponseError} from "../../shared/httpClient";
import {UnauthorizedError} from "../../core/models/errors/UnauthorizedError";
import {GameSessionRepository} from "./gameSessionRepository";

export class GameSessionService {

    private readonly client: GameSessionClient;
    private readonly repository: GameSessionRepository;

    constructor(client: GameSessionClient, repository: GameSessionRepository) {
        this.client = client;
        this.repository = repository;
    }


    listSessions(): Promise<string[]> {
        return this.client.list()
            .catch(error => handleResponseError(error, 401, () => {
                throw new UnauthorizedError();
            }));
    }

    createSession(seed: string | null): Promise<string> {
        return this.client.create(seed)
            .catch(error => handleResponseError(error, 401, () => {
                throw new UnauthorizedError();
            }));
    }

    joinSession(gameId: string): Promise<void> {
        return this.client.join(gameId)
            .catch(error => handleResponseError(error, 401, () => {
                throw new UnauthorizedError();
            }));
    }

    deleteSession(gameId: string): Promise<void> {
        return this.client.delete(gameId)
            .catch(error => handleResponseError(error, 401, () => {
                throw new UnauthorizedError();
            }));
    }

    connectSession(gameId: string): Promise<void> {
        return Promise.resolve()
            .then(() => this.repository.setGameState("loading"))
            .then(() => this.client.config())
            .then(config => this.repository.setGameConfig(config))
            // .then(() => this.client.connect(gameId)) // todo -> temp
            .then(() => this.repository.setGameState("playing"))
            .catch(() => this.repository.setGameState("error"));
    }

}