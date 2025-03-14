import {TileIdentifier} from "./tile";
import {MapMode} from "./mapMode";
import {GameSessionState} from "./gameSessionState";

export interface GameSession {
    sessionState: GameSessionState,
    turnState: "playing" | "waiting"
    turn: number,
    selectedTile: TileIdentifier | null;
    hoverTile: TileIdentifier | null;
    mapMode: MapMode;
}