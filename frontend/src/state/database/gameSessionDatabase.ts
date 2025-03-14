import {AbstractSingletonDatabase} from "../../common/db/database/abstractSingletonDatabase";
import {GameSession} from "../../models/misc/gameSession";
import {MapMode} from "../../models/misc/mapMode";

export class GameSessionDatabase extends AbstractSingletonDatabase<GameSession> {

	constructor() {
		super({
			sessionState: "none",
			turnState: "playing",
			turn: -1,
			selectedTile: null,
			hoverTile: null,
			mapMode: MapMode.DEFAULT,
		});
	}

	// public setState(state: "none" | "loading" | "playing" | "error") {
	// 	this.update(() => ({
	// 		sessionState: state,
	// 	}));
	// }
	//
	// public getState(): "none" | "loading" | "playing" | "error" {
	// 	return this.get().sessionState;
	// }
	//
	// public setTurnState(turnState: "playing" | "waiting") {
	// 	this.update(() => ({
	// 		turnState: turnState,
	// 	}));
	// }
	//
	// public setTurn(turn: number) {
	// 	this.update(() => ({
	// 		turn: turn,
	// 	}));
	// }
	//
	// public setMapMode(mode: MapMode) {
	// 	this.update(() => ({
	// 		mapMode: mode,
	// 	}));
	// }
	//
	// public getMapMode(): MapMode {
	// 	return this.get().mapMode;
	// }
	//
	// public setSelectedTile(tile: TileIdentifier | null) {
	// 	this.update(() => ({
	// 		selectedTile: tile,
	// 	}));
	// }
	//
	// public getSelectedTile(): TileIdentifier | null {
	// 	return this.get().selectedTile;
	// }
	//
	// public setHoverTile(tile: TileIdentifier | null) {
	// 	this.update(() => ({
	// 		hoverTile: tile,
	// 	}));
	// }
	//
	// public getHoverTile(): TileIdentifier | null {
	// 	return this.get().hoverTile;
	// }

}
