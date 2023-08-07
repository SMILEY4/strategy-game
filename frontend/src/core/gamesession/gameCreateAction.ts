import {UnauthorizedError} from "../models/errors/UnauthorizedError";
import {ResponseError} from "../../external/api/clients/httpClient";
import {GameApi} from "../required/gameApi";

/**
 * Create a new game
 */
export class GameCreateAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(seed: string | null): Promise<string> {
        console.log("create new game (seed=" + seed + ")");
        return this.gameApi.create(seed)
            .catch(error => {
                if (error instanceof ResponseError && error.status === 401) {
                    throw new UnauthorizedError();
                }
                throw error;
            });
    }

}