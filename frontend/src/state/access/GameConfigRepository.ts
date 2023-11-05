import {GameConfig} from "../../models/gameConfig";
import {LocalGameSessionStore} from "../local/LocalGameSessionStore";

export class GameConfigRepository {

    public setGameConfig(config: GameConfig | null) {
        LocalGameSessionStore.useState.getState().setConfig(config);
    }

    public getGameConfig(): GameConfig {
        const config = LocalGameSessionStore.useState.getState().config;
        if (config) {
            return config;
        } else {
            throw new Error("No config present");
        }
    }

}