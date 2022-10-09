import {GameApi} from "./required/gameApi";

/**
 * Create a new game
 */
export class GameCreateAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(): Promise<string> {
        console.log("create new game");
        return this.gameApi.create();
    }

}