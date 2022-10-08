import {GameConfig} from "../../models/state/gameConfig";

export interface GameConfigRepository {
    setConfig: (config: GameConfig) => void
    getConfig: () => GameConfig
}