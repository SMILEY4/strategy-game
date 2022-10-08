import {GameConfig} from "../../../models/state/gameConfig";
import {GameConfigStore} from "./gameConfigStore";

export class GameConfigStateAccess {

    getGameConfig(): GameConfig {
        return GameConfigStore.useState.getState().config;
    }

    setGameConfig(config: GameConfig): void {
        return GameConfigStore.useState.getState().setConfig(config);
    }

}
