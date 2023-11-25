import {RemoteGameState} from "../remote/RemoteGameState";
import {RemoteGameStateStore} from "../remote/RemoteGameStore";

export class RemoteGameStateRepository {

    public getGameState(): RemoteGameState {
        return RemoteGameStateStore.useState.getState().gameState;
    }

    public getRevId(): string {
        return RemoteGameStateStore.useState.getState().revId;
    }

    public setGameState(state: RemoteGameState) {
        RemoteGameStateStore.useState.getState().set(state);
    }


}