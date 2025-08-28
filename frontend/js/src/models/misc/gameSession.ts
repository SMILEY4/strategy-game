import {MapMode} from "./mapMode";
import {GameSessionState} from "./gameSessionState";
import {TileSummary} from "../tile/tileSummary";

export interface GameSession {
	sessionState: GameSessionState,
	turnState: "playing" | "waiting"
	turn: number,
	selectedTile: TileSummary | null;
	hoverTile: TileSummary | null;
	mapMode: MapMode;
}