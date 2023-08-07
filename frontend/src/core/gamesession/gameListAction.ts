import {UnauthorizedError} from "../models/errors/UnauthorizedError";
import {ResponseError} from "../../external/api/clients/httpClient";
import {GameApi} from "../required/gameApi";

/**
 * Provide a list all game-sessions the current user is part of.
 */
export class GameListAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(): Promise<string[]> {
        console.debug("Listing game-sessions");
        return this.gameApi.list()
            .catch(error => {
                if (error instanceof ResponseError && error.status === 401) {
                    throw new UnauthorizedError();
                }
                throw error;
            });
    }

}