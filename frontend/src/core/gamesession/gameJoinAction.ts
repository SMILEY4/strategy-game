import {UnauthorizedError} from "../models/errors/UnauthorizedError";
import {ResponseError} from "../../external/api/clients/httpClient";
import {GameApi} from "../required/gameApi";

/**
 * Join a game as a player (don't connect yet)
 */
export class GameJoinAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(gameId: string): Promise<void> {
        console.debug("Joining game", gameId);
        return this.gameApi.join(gameId)
            .catch(error => {
                if (error instanceof ResponseError && error.status === 401) {
                    throw new UnauthorizedError();
                }
                throw error;
            });
    }

}