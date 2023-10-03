import {GameStore} from "../../_old_external/state/game/gameStore";
import {CameraState} from "../models/cameraState";
import {Command} from "../models/command";
import {GameState} from "../models/gameState";
import {TilePosition} from "../models/tilePosition";
import {CityCreationPreview} from "../models/CityCreationPreview";

export interface GameRepository {
    getRevisionId: () => string
    getCompleteState: () => GameStore.StateValues

    setGameId: (id: string) => void;
    getGameId: () => string;

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

    getPreviewCityCreation: () => (CityCreationPreview | null)
    setPreviewCityCreation: (preview: CityCreationPreview | null) => void

}