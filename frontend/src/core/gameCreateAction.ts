import {GameApi} from "./required/gameApi";

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
        return this.gameApi.create(seed);
    }

}