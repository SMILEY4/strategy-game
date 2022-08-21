import {CameraState} from "../../../models/state/cameraState";
import {Command} from "../../../models/state/command";
import {GameState} from "../../../models/state/gameState";
import {TilePosition} from "../../../models/state/tilePosition";
import {LocalGameStore} from "./localGameStore";

export class LocalGameStateAccess {

    getStateRevision(): string {
        return LocalGameStore.useState.getState().revisionId
    }

    setCurrentState(state: GameState): void {
        LocalGameStore.useState.getState().setCurrentState(state);
    }

    getCurrentState(): GameState {
        return LocalGameStore.useState.getState().currentState;
    }

    addCommand(command: Command): void {
        LocalGameStore.useState.getState().addCommand(command);
    }

    clearCommands(): void {
        LocalGameStore.useState.getState().clearCommands();
    }

    getCommands(): Command[] {
        return LocalGameStore.useState.getState().commands;
    }

    setSelectedTile(q: number, r: number): void {
        LocalGameStore.useState.getState().setTileSelected({
            q: q,
            r: r
        });
    }

    clearSelectedTile(): void {
        LocalGameStore.useState.getState().setTileSelected(null);
    }

    getSelectedTile(): TilePosition | null {
        return LocalGameStore.useState.getState().tileSelected;
    }

    setMouseOverTile(q: number, r: number): void {
        LocalGameStore.useState.getState().setTileMouseOver({
            q: q,
            r: r
        });
    }

    clearMouseOverTile(): void {
        LocalGameStore.useState.getState().setTileMouseOver(null);
    }

    getMouseOverTile(): TilePosition | null {
        return LocalGameStore.useState.getState().tileMouseOver;
    }

    getCamera(): CameraState {
        return LocalGameStore.useState.getState().camera;
    }

    setCameraPosition(x: number, y: number): void {
        LocalGameStore.useState.getState().setCameraPosition(x, y);
    }

    setCameraZoom(zoom: number): void {
        LocalGameStore.useState.getState().setCameraZoom(zoom);
    }

}