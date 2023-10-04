import {GameSessionClient} from "./gameSessionClient";
import {handleResponseError} from "../../shared/httpClient";
import {UnauthorizedError} from "../../_old_core/models/errors/UnauthorizedError";
import {GameSessionStateAccess} from "../../state/access/GameSessionStateAccess";

export class GameSessionService {

    private readonly client: GameSessionClient;

    constructor(client: GameSessionClient) {
        this.client = client;
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
            .then(() => GameSessionStateAccess.setGameState("loading"))
            .then(() => this.client.config())
            .then(config => GameSessionStateAccess.setGameConfig(config))
            .then(() => this.client.connect(gameId))
            .then(() => GameSessionStateAccess.setGameState("playing"))
            .catch(() => GameSessionStateAccess.setGameState("error"));
    }


}