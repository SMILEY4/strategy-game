import {GameStore} from "../external/state/game/gameStore";
import {UserStore} from "../external/state/user/userStore";

export namespace Hooks {

    export function useIsAuthenticated(): boolean {
        return !!UserStore.useState(state => state.idToken);
    }

    export function useCurrentGameState(): "idle" | "loading" | "active" {
        return GameStore.useState(state => state.currentState);
    }

    export function useTurnState(): "active" | "submitted" {
        return GameStore.useState(state => state.turnState);
    }

    export function useSelectedTile(): null | [number, number] {
        return GameStore.useState(state => state.tileSelected);
    }

}