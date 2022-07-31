import {CameraState} from "../../../models/cameraState";
import {CommandCreateCity} from "../../../models/commandCreateCity";
import {CommandPlaceMarker} from "../../../models/commandPlaceMarker";
import {GameStore} from "./gameStore";

export class GameStateAccess {

    setLoading(gameId: string): void {
        GameStore.useState.getState().setLoading(gameId);
    }

    getCurrentState(): "idle" | "loading" | "active" {
        return GameStore.useState.getState().currentState;
    }

    setCurrentState(state: "idle" | "loading" | "active"): void {
        return GameStore.useState.getState().setCurrentState(state);
    }

    getCommands(): (CommandPlaceMarker | CommandCreateCity)[] {
        return GameStore.useState.getState().playerCommands;
    }

    addCommand(command: CommandPlaceMarker | CommandCreateCity): void {
        GameStore.useState.getState().addCommand(command);
    }

    clearCommands(): void {
        GameStore.useState.getState().clearCommands();
    }

    setTurnState(state: "active" | "submitted"): void {
        GameStore.useState.getState().setTurnState(state);
    }

    getTurnState(): "active" | "submitted" {
        return GameStore.useState.getState().turnState;
    }

    moveCamera(dx: number, dy: number): void {
        GameStore.useState.getState().moveCamera(dx, dy);
    }

    zoomCamera(d: number): void {
        GameStore.useState.getState().zoomCamera(d);
    }

    getCamera(): CameraState {
        return GameStore.useState.getState().camera;
    }

    setTileMouseOver(q: number, r: number): void {
        GameStore.useState.getState().setTileMouseOver([q, r]);
    }

    clearTileMouseOver(): void {
        GameStore.useState.getState().setTileMouseOver(null);
    }

    getTileMouseOver(): [number, number] | null {
        return GameStore.useState.getState().tileMouseOver;
    }

    setTileSelected(q: number, r: number): void {
        GameStore.useState.getState().setTileSelected([q, r]);
    }

    clearTileSelected(): void {
        GameStore.useState.getState().setTileSelected(null);
    }

    getTileSelected(): [number, number] | null {
        return GameStore.useState.getState().tileSelected;
    }

}