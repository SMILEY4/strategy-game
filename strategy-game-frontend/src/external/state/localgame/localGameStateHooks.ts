import {GameState} from "../../../models/state/gameState";
import {TilePosition} from "../../../models/state/tilePosition";
import {LocalGameStore} from "./localGameStore";

export namespace LocalGameStateHooks {

    export function useCurrentGameState(): GameState {
        return LocalGameStore.useState(state => state.currentState)
    }

    export function useSelectedTile(): TilePosition | null {
        return LocalGameStore.useState(state => state.tileSelected)
    }

}