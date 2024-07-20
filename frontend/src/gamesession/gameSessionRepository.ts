import {GameSessionDatabase} from "../state/database/gameSessionDatabase";

export class GameSessionRepository {

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

	public getTurnState(): "playing" | "waiting" {
		return this.database.get().turnState;
	}

	public setTurn(turn: number) {
		this.database.setTurn(turn);
	}

}