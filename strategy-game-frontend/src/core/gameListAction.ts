import {GameApi} from "./required/gameApi";

/**
 * Provide a list all games the current user is part of.
 */
export class GameListAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(): Promise<string[]> {
        console.debug("Listing Games");
        return this.gameApi.list();
    }


}