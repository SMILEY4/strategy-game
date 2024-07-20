import {AbstractSingletonDatabase} from "../../shared/db/database/abstractSingletonDatabase";
import {GameSession} from "../../models/gameSession";
import {GameSessionState} from "../../models/gameSessionState";
import {GameTurnState} from "../../models/gameTurnState";
import {AppCtx} from "../../appContext";
import {usePartialSingletonEntity, useSingletonEntity} from "../../shared/db/adapters/databaseHooks";
import {MapMode} from "../../models/mapMode";
import {TileIdentifier} from "../../models/tile";

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

    public setState(state: "none" | "loading" | "playing" | "error") {
        this.update(() => ({
            sessionState: state,
        }));
    }

    public getState(): "none" | "loading" | "playing" | "error" {
        return this.get().sessionState;
    }

    public setTurnState(turnState: "playing" | "waiting") {
        this.update(() => ({
            turnState: turnState,
        }));
    }

    public setTurn(turn: number) {
        this.update(() => ({
            turn: turn,
        }));
    }

    public setMapMode(mode: MapMode) {
        this.update(() => ({
            mapMode: mode,
        }));
    }

    public getMapMode(): MapMode {
        return this.get().mapMode;
    }

    public setSelectedTile(tile: TileIdentifier | null) {
        this.update(() => ({
            selectedTile: tile,
        }));
    }

    public getSelectedTile(): TileIdentifier | null {
        return this.get().selectedTile;
    }

    public setHoverTile(tile: TileIdentifier | null) {
        this.update(() => ({
            hoverTile: tile,
        }));
    }

    public getHoverTile(): TileIdentifier | null {
        return this.get().hoverTile;
    }

}

export namespace GameSessionDatabase {

    export function useTurn(): number {
        return usePartialSingletonEntity(AppCtx.GameSessionDatabase(), e => e.turn);
    }

    export function useGameSessionState(): GameSessionState {
        return usePartialSingletonEntity(AppCtx.GameSessionDatabase(), e => e.sessionState);
    }

    export function useGameTurnState(): GameTurnState {
        return usePartialSingletonEntity(AppCtx.GameSessionDatabase(), e => e.turnState);
    }

    export function useSetGameTurnState(): (state: GameTurnState) => void {
        const db = AppCtx.GameSessionDatabase()
        return (state: GameTurnState) => {
            db.setTurnState(state);
        };
    }

    export function useMapMode(): [MapMode, (mode: MapMode) => void] {
        const db = AppCtx.GameSessionDatabase();
        const mapMode = usePartialSingletonEntity(db, e => e.mapMode);
        return [
            mapMode,
            (m: MapMode) => db.setMapMode(m),
        ];
    }

    export function useSelectedTile(): TileIdentifier | null {
        return usePartialSingletonEntity(AppCtx.GameSessionDatabase(), e => e.selectedTile)
    }

}
