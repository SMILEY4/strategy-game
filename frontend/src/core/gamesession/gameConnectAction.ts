import {GameState} from "../models/gameState";
import {GameRepository} from "../required/gameRepository";
import {GameApi} from "../required/gameApi";
import {GameConfigRepository} from "../required/gameConfigRepository";

/**
 * Connect to a game
 */
export class GameConnectAction {

    private readonly gameApi: GameApi;
    private readonly gameRepository: GameRepository;
    private readonly gameConfigRepository: GameConfigRepository;

    constructor(gameApi: GameApi, gameRepository: GameRepository, gameConfigRepository: GameConfigRepository) {
        this.gameApi = gameApi;
        this.gameRepository = gameRepository;
        this.gameConfigRepository = gameConfigRepository;
    }

    perform(gameId: string): Promise<void> {
        console.log("connect to game ", gameId);
        return this.gameApi.config()
            .then(config => this.gameConfigRepository.setConfig(config))
            .then(() => this.gameApi.connect(gameId))
            .then(() => {
                this.gameRepository.setGameState(GameState.LOADING);
                this.gameRepository.setGameId(gameId);
            });
    }

}