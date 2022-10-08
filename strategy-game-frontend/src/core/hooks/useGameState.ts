import {GameStore} from "../../external/state/game/gameStore";
import {GameState} from "../../models/state/gameState";

export function useGameState(): GameState {
    return GameStore.useState(state => state.currentState);
}