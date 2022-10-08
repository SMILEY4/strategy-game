import {GameRepository} from "../../core/required/gameRepository";
import {CameraState} from "../../models/state/cameraState";
import {Command} from "../../models/state/command";
import {GameState} from "../../models/state/gameState";
import {TilePosition} from "../../models/state/tilePosition";
import {LocalGameStateAccess} from "./localgame/localGameStateAccess";
import {LocalGameStore} from "./localgame/localGameStore";

export class GameRepositoryImpl implements GameRepository {

    private readonly localGameStateAccess: LocalGameStateAccess;

    constructor(localGameStateAccess: LocalGameStateAccess) {
        this.localGameStateAccess = localGameStateAccess;

    }


    getRevisionId(): string {
        return this.localGameStateAccess.getStateRevision();
    }


    getCompleteState(): LocalGameStore.StateValues {
        return this.localGameStateAccess.getState();
    }


    setGameState(state: GameState): void {
        this.localGameStateAccess.setCurrentState(state);
    }

    getGameState(): GameState {
        return this.localGameStateAccess.getCurrentState();
    }

    clearMouseOverTile(): void {
        this.localGameStateAccess.clearMouseOverTile();
    }


    setMouseOverTile(q: number, r: number): void {
        this.localGameStateAccess.setMouseOverTile(q, r);
    }


    clearSelectedTile(): void {
        this.localGameStateAccess.clearSelectedTile();
    }


    setSelectedTile(q: number, r: number): void {
        this.localGameStateAccess.setSelectedTile(q, r);
    }


    getSelectedTile(): TilePosition | null {
        return this.localGameStateAccess.getSelectedTile();
    }


    setCameraPosition(x: number, y: number): void {
        this.localGameStateAccess.setCameraPosition(x, y);
    }


    setCameraZoom(zoom: number): void {
        this.localGameStateAccess.setCameraZoom(zoom);
    }

    getCamera(): CameraState {
        return this.localGameStateAccess.getCamera();
    }


    clearCommands(): void {
        this.localGameStateAccess.clearCommands();
    }


    addCommand(command: Command): void {
        this.localGameStateAccess.addCommand(command);
    }


    getCommands(): Command[] {
        return this.localGameStateAccess.getCommands();
    }

}