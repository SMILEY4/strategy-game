import {MapMode} from "./mapMode";
import {TileSummary} from "../tile/tileSummary";

/**
 * Local data for the active game session.
 */
export interface GameSession {
	sessionState: GameSession.SessionState,
	turnState: GameSession.TurnState
	turn: number,
	selectedTile: TileSummary | null;
	hoverTile: TileSummary | null;
	mapMode: MapMode;
}

export namespace GameSession {

	/**
	 * The state of the overall session, over its complete lifecycle.
	 */
	export enum SessionState {
		None = "none",
		Loading = "loading",
		Playing = "playing",
		Error = "error",
	}

	/**
	 * The state of the current turn.
	 */
	export enum TurnState {
		Waiting = "waiting",
		Playing = "playing",
	}

}