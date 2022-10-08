import {GameRepository} from "../../core/required/gameRepository";
import {CameraState} from "../../models/state/cameraState";
import {Command} from "../../models/state/command";
import {GameState} from "../../models/state/gameState";
import {TilePosition} from "../../models/state/tilePosition";
import {LocalGameStore} from "./localgame/localGameStore";

export class GameRepositoryImpl implements GameRepository {

    getRevisionId(): string {
        return LocalGameStore.useState.getState().revisionId;
    }

    getCompleteState(): LocalGameStore.StateValues {
        return LocalGameStore.useState.getState();
    }

    setGameState(state: GameState): void {
        LocalGameStore.useState.getState().setCurrentState(state);
    }

    getGameState(): GameState {
        return LocalGameStore.useState.getState().currentState;
    }

    clearMouseOverTile(): void {
        LocalGameStore.useState.getState().setTileMouseOver(null);
    }

    setMouseOverTile(q: number, r: number): void {
        LocalGameStore.useState.getState().setTileMouseOver({
            q: q,
            r: r
        });
    }

    clearSelectedTile(): void {
        LocalGameStore.useState.getState().setTileSelected(null);
    }

    setSelectedTile(q: number, r: number): void {
        LocalGameStore.useState.getState().setTileSelected({
            q: q,
            r: r
        });
    }

    getSelectedTile(): TilePosition | null {
        return LocalGameStore.useState.getState().tileSelected;
    }

    setCameraPosition(x: number, y: number): void {
        LocalGameStore.useState.getState().setCameraPosition(x, y);
    }

    setCameraZoom(zoom: number): void {
        LocalGameStore.useState.getState().setCameraZoom(zoom);
    }

    getCamera(): CameraState {
        return LocalGameStore.useState.getState().camera;
    }

    clearCommands(): void {
        LocalGameStore.useState.getState().clearCommands();
    }

    addCommand(command: Command): void {
        LocalGameStore.useState.getState().addCommand(command);
    }

    getCommands(): Command[] {
        return LocalGameStore.useState.getState().commands;
    }

}