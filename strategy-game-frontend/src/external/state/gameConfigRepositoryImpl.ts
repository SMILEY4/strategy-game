import {GameConfigRepository} from "../../core/required/gameConfigRepository";
import {GameConfig} from "../../models/state/gameConfig";
import {GameConfigStore} from "./gameconfig/gameConfigStore";

export class GameConfigRepositoryImpl implements GameConfigRepository {

    setConfig(config: GameConfig): void {
        GameConfigStore.useState.getState().setConfig(config);
    }

    getConfig(): GameConfig {
        return GameConfigStore.useState.getState().config;
    }

}