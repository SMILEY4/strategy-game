import {GameConfigRepository} from "../../../core/required/gameConfigRepository";
import {GameConfig} from "../../../core/models/gameConfig";
import {GameConfigStore} from "./gameConfigStore";

export class GameConfigRepositoryImpl implements GameConfigRepository {

    setConfig(config: GameConfig): void {
        GameConfigStore.useState.getState().setConfig(config);
    }

    getConfig(): GameConfig {
        return GameConfigStore.useState.getState().config;
    }

}