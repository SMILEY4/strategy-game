import {GameState} from "../models/state/gameState";
import {GameApi} from "./required/gameApi";
import {GameRepository} from "./required/gameRepository";

/**
 * Submit and end the turn
 */
export class TurnSubmitAction {

    private readonly gameRepository: GameRepository;
    private readonly gameApi: GameApi;

    constructor(gameStateAccess: GameRepository, gameApi: GameApi) {
        this.gameRepository = gameStateAccess;
        this.gameApi = gameApi;
    }

    perform(): void {
        if (this.gameRepository.getGameState() == GameState.PLAYING) {
            const commands = this.gameRepository.getCommands();
            console.log("submit turn", commands);
            this.gameApi.submitTurn(commands);
            this.gameRepository.setGameState(GameState.SUBMITTED);
        }
    }

}