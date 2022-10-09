import {GameState} from "../models/state/gameState";
import {GameApi} from "./required/gameApi";
import {GameRepository} from "./required/gameRepository";

/**
 * Connect to a game
 */
export class GameConnectAction {

    private readonly gameApi: GameApi;
    private readonly gameRepository: GameRepository;

    constructor(gameApi: GameApi, gameRepository: GameRepository) {
        this.gameApi = gameApi;
        this.gameRepository = gameRepository;
    }

    perform(gameId: string): Promise<void> {
        console.log("connect to game ", gameId);
        return this.gameApi.connect(gameId).then(() => {
            this.gameRepository.setGameState(GameState.LOADING);
        });
    }

}