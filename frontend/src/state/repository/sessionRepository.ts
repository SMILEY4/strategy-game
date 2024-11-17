import {GameSessionDatabase} from "../database/gameSessionDatabase";
import {MapMode} from "../../models/base/mapMode";

export class SessionRepository {

	private readonly database: GameSessionDatabase;

	constructor(database: GameSessionDatabase) {
		this.database = database;
	}

	public setSessionState(state: "none" | "loading" | "playing" | "error") {
		this.database.update(() => ({
			sessionState: state,
		}));
	}

	public getSessionState(): "none" | "loading" | "playing" | "error" {
		return this.database.get().sessionState;
	}

	public setTurnState(state: "playing" | "waiting") {
		this.database.update(() => ({
			turnState: state,
		}));
	}

	public setTurn(turn: number) {
		this.database.setTurn(turn);
	}

	public getTurn(): number {
		return this.database.get().turn;
	}

	public getMapMode(): MapMode {
		return this.database.getMapMode();
	}

}