import {GameConfigStore} from "../../external/state/gameconfig/gameConfigStore";
import {GameConfig} from "../../models/state/gameConfig";

export function useGameConfig(): GameConfig {
    return GameConfigStore.useState(state => state.config);
}