import {LocalGameSessionStore} from "../local/session/LocalGameSessionStore";
import {GameConfig} from "../../models/gameConfig";

export namespace GameSessionStateAccess {

    export function setGameState(state: "none" | "loading" | "error" | "playing") {
        LocalGameSessionStore.useState.getState().setState(state);
    }

    export function setGameConfig(config: GameConfig | null) {
        return LocalGameSessionStore.useState.getState().setConfig(config);
    }

    export function useGameState(): "none" | "loading" | "playing" | "error" {
        return LocalGameSessionStore.useState(state => state.state);
    }

}