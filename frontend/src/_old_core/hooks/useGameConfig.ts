import {GameConfigStore} from "../../_old_external/state/gameconfig/gameConfigStore";
import {GameConfig} from "../models/gameConfig";

export function useGameConfig(): GameConfig {
    return GameConfigStore.useState(state => state.config);
}