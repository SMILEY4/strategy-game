import {GameRepository} from "../../../core/required/gameRepository";
import {CameraState} from "../../../models/state/cameraState";
import {Command} from "../../../models/state/command";
import {GameState} from "../../../models/state/gameState";
import {TilePosition} from "../../../models/state/tilePosition";
import {GameStore} from "./gameStore";

export class GameRepositoryImpl implements GameRepository {

    getRevisionId(): string {
        return GameStore.useState.getState().revisionId;
    }

    getCompleteState(): GameStore.StateValues {
        return GameStore.useState.getState();
    }

    setGameState(state: GameState): void {
        GameStore.useState.getState().setCurrentState(state);
    }

    getGameState(): GameState {
        return GameStore.useState.getState().currentState;
    }

    clearMouseOverTile(): void {
        GameStore.useState.getState().setTileMouseOver(null);
    }

    setMouseOverTile(q: number, r: number): void {
        GameStore.useState.getState().setTileMouseOver({
            q: q,
            r: r
        });
    }

    clearSelectedTile(): void {
        GameStore.useState.getState().setTileSelected(null);
    }

    setSelectedTile(q: number, r: number): void {
        GameStore.useState.getState().setTileSelected({
            q: q,
            r: r
        });
    }

    getSelectedTile(): TilePosition | null {
        return GameStore.useState.getState().tileSelected;
    }

    setCameraPosition(x: number, y: number): void {
        GameStore.useState.getState().setCameraPosition(x, y);
    }

    setCameraZoom(zoom: number): void {
        GameStore.useState.getState().setCameraZoom(zoom);
    }

    getCamera(): CameraState {
        return GameStore.useState.getState().camera;
    }

    clearCommands(): void {
        GameStore.useState.getState().clearCommands();
    }

    addCommand(command: Command): void {
        GameStore.useState.getState().addCommand(command);
    }

    getCommands(): Command[] {
        return GameStore.useState.getState().commands;
    }

}