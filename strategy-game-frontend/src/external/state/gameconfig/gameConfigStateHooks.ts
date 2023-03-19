import {GameConfig} from "../../../models/state/gameConfig";
import {GameConfigStore} from "./gameConfigStore";

export namespace GameConfigStateHooks {

    export function useGameConfig(): GameConfig {
        return GameConfigStore.useState(state => state.config);
    }

    export function useSetGameConfig(): (config: GameConfig) => void {
        return (config: GameConfig) => {
            GameConfigStore.useState().setConfig(config);
        };
    }

}