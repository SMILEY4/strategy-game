import {LocalGameStore} from "../../external/state/localgame/localGameStore";
import {CameraState} from "../../models/state/cameraState";
import {Command} from "../../models/state/command";
import {GameState} from "../../models/state/gameState";
import {TilePosition} from "../../models/state/tilePosition";

export interface GameRepository {
    getRevisionId: () => string
    getCompleteState: () => LocalGameStore.StateValues

    setGameState: (state: GameState) => void
    getGameState: () => GameState

    clearMouseOverTile: () => void;
    setMouseOverTile: (q: number, r: number) => void;

    clearSelectedTile: () => void;
    setSelectedTile: (q: number, r: number) => void
    getSelectedTile: () => TilePosition | null

    setCameraPosition: (x: number, y: number) => void
    setCameraZoom: (zoom: number) => void
    getCamera: () => CameraState

    clearCommands: () => void
    addCommand: (command: Command) => void
    getCommands: () => Command[]

}