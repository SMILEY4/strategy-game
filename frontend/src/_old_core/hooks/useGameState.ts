import {GameStore} from "../../_old_external/state/game/gameStore";
import {GameState} from "../models/gameState";

export function useGameState(): GameState {
    return GameStore.useState(state => state.currentState);
}