import {GameConfig} from "../../core/models/gameConfig";
import {GameSessionStore} from "./gameSessionStore";

export class GameSessionRepository {

    setGameState(state: "none" | "loading" | "error" | "playing") {
        GameSessionStore.useState.getState().setState(state);
    }

    setGameConfig(config: GameConfig | null) {
        return GameSessionStore.useState.getState().setConfig(config);
    }

}