import {GameSessionClient} from "./gameSessionClient";
import {handleResponseError} from "../../shared/httpClient";
import {UnauthorizedError} from "../../models/UnauthorizedError";
import {GameSessionDatabase} from "../../state/database/gameSessionDatabase";
import {GameSessionMeta} from "../../models/gameSessionMeta";
import {RenderGraphPreloader} from "../../renderer/core/graph/renderGraphPreloader";

export class GameSessionService {

    private readonly client: GameSessionClient;
    private readonly gameSessionDb: GameSessionDatabase;

    constructor(client: GameSessionClient, gameSessionDb: GameSessionDatabase) {
        this.client = client;
        this.gameSessionDb = gameSessionDb;
    }


    public listSessions(): Promise<GameSessionMeta[]> {
        return this.client.list()
            .catch(error => handleResponseError(error, 401, () => {
                throw new UnauthorizedError();
            }));
    }

    public createSession(name: string, seed: string | null): Promise<string> {
        return this.client.create(name, seed)
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
            .then(() => this.gameSessionDb.setState("loading"))
            .then(() => this.client.config())
            .then(config => this.gameSessionDb.setConfig(config))
            .then(() => RenderGraphPreloader.tempLoad())
            .then(() => this.client.connect(gameId))
            .catch(() => this.gameSessionDb.setState("error"));
    }

}