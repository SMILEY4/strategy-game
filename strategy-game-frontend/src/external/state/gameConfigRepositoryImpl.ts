import {GameConfigRepository} from "../../core/required/gameConfigRepository";
import {GameConfig} from "../../models/state/gameConfig";
import {GameConfigStateAccess} from "./gameconfig/gameConfigStateAccess";

export class GameConfigRepositoryImpl implements GameConfigRepository {

    private readonly gameConfigStateAccess: GameConfigStateAccess;

    constructor(gameConfigStateAccess: GameConfigStateAccess) {
        this.gameConfigStateAccess = gameConfigStateAccess;
    }


    setConfig(config: GameConfig): void {
        this.gameConfigStateAccess.setGameConfig(config);
    }


    getConfig(): GameConfig {
        return this.gameConfigStateAccess.getGameConfig();
    }

}