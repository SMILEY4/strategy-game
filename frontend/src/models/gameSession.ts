import {TileIdentifier} from "./tile";
import {MapMode} from "./mapMode";

export interface GameSession {
    state: "none" | "loading" | "playing" | "error",
    turnState: "playing" | "waiting"
    turn: number,
    selectedTile: TileIdentifier | null;
    hoverTile: TileIdentifier | null;
    mapMode: MapMode;
}