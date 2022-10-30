import {GameConfig} from "../models/gameConfig";

export interface GameConfigRepository {
    setConfig: (config: GameConfig) => void
    getConfig: () => GameConfig
}