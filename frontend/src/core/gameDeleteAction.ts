import {GameApi} from "./required/gameApi";

/**
 * Delete a given game
 */
export class GameDeleteAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(gameId: string): Promise<void> {
        console.log("deleting game " +gameId);
        return this.gameApi.delete(gameId);
    }

}