import {LocalGameSessionStore} from "../local/session/LocalGameSessionStore";
import {GameConfig} from "../../models/gameConfig";

export namespace GameSessionStateAccess {

    export function setGameState(state: "none" | "loading" | "error" | "playing") {
        LocalGameSessionStore.useState.getState().setState(state);
    }

    export function setGameConfig(config: GameConfig | null) {
        LocalGameSessionStore.useState.getState().setConfig(config);
    }

    export function getGameConfig(): GameConfig {
        const config = LocalGameSessionStore.useState.getState().config;
        if (config) {
            return config;
        } else {
            throw new Error("No config present");
        }
    }

    export function useGameState(): "none" | "loading" | "playing" | "error" {
        return LocalGameSessionStore.useState(state => state.state);
    }

    export function useTurnState(): "playing" | "waiting" {
        return LocalGameSessionStore.useState(state => state.turnState);
    }

    export function useSetTurnState(): (state: "playing" | "waiting") => void {
        return LocalGameSessionStore.useState().setTurnState;
    }

    export function setTurnState(state: "playing" | "waiting") {
        LocalGameSessionStore.useState.getState().setTurnState(state);
    }

}