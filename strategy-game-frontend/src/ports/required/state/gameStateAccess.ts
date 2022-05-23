import {CameraState} from "../../models/CameraState";
import {CommandPlaceMarker} from "../../models/CommandPlaceMarker";

export interface GameStateAccess {
    setLoading: (gameId: string) => void;
    getCurrentState: () => "idle" | "loading" | "active";
    setCurrentState: (state: "idle" | "loading" | "active") => void;
    setTurnState: (state: "active" | "submitted") => void;
    getCommands: () => CommandPlaceMarker[];
    addCommand: (command: CommandPlaceMarker) => void;
    clearCommands: () => void
    moveCamera: (dx: number, dy: number) => void;
    zoomCamera: (d: number) => void;
    getCamera: () => CameraState;
    setTileMouseOver: (q: number, r: number) => void;
    clearTileMouseOver: () => void;
    getTileMouseOver: () => [number, number] | null
}