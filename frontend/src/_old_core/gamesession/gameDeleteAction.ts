import {UnauthorizedError} from "../models/errors/UnauthorizedError";
import {ResponseError} from "../../shared/httpClient";
import {GameApi} from "../required/gameApi";

/**
 * Delete a given game
 */
export class GameDeleteAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(gameId: string): Promise<void> {
        console.log("deleting game " + gameId);
        return this.gameApi.delete(gameId)
            .catch(error => {
                if (error instanceof ResponseError && error.status === 401) {
                    throw new UnauthorizedError();
                }
                throw error;
            });
    }

}