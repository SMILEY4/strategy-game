import {GameSessionDatabase} from "../database/gameSessionDatabase";
import {MapMode} from "../../models/base/mapMode";
import {usePartialSingletonEntity} from "../../common/db/adapters/databaseHooks";
import {GameSessionState} from "../../models/base/gameSessionState";
import {GameTurnState} from "../../models/base/gameTurnState";
import {useDI} from "../../appContext";

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

export namespace SessionRepository {

	export function useTurn(): number {
		const db = useDI<GameSessionDatabase>(GameSessionDatabase.name)
		return usePartialSingletonEntity(db, e => e.turn);
	}

	export function useGameSessionState(): GameSessionState {
		const db = useDI<GameSessionDatabase>(GameSessionDatabase.name)
		return usePartialSingletonEntity(db, e => e.sessionState);
	}

	export function useGameTurnState(): GameTurnState {
		const db = useDI<GameSessionDatabase>(GameSessionDatabase.name)
		return usePartialSingletonEntity(db, e => e.turnState);
	}

	export function useSetGameTurnState(): (state: GameTurnState) => void {
		const db = useDI<GameSessionDatabase>(GameSessionDatabase.name)
		return (state: GameTurnState) => {
			db.setTurnState(state);
		};
	}

	export function useMapMode(): [MapMode, (mode: MapMode) => void] {
		const db = useDI<GameSessionDatabase>(GameSessionDatabase.name)
		const mapMode = usePartialSingletonEntity(db, e => e.mapMode);
		return [
			mapMode,
			(m: MapMode) => db.setMapMode(m),
		];
	}

}