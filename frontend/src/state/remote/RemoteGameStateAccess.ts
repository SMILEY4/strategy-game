import {RemoteGameState} from "./RemoteGameState";
import {RemoteGameStateStore} from "./RemoteGameStore";

export namespace RemoteGameStateAccess {

    export function setRemoteGameState(state: RemoteGameState) {
        RemoteGameStateStore.useState.getState().set(state);
    }

    export function getRemoteGameState(): RemoteGameState {
        return RemoteGameStateStore.useState.getState();
    }

    export function useSetRemoteGameState(): (state: RemoteGameState) => void {
        return RemoteGameStateStore.useState().set;
    }

    export function useRemoteGameState(): RemoteGameState {
        return RemoteGameStateStore.useState();
    }

}