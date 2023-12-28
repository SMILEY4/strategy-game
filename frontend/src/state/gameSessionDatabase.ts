import {AbstractSingletonDatabase} from "../shared/db/database/abstractSingletonDatabase";
import {GameSession} from "../models/gameSession";
import {GameConfig} from "../models/gameConfig";
import {GameSessionState} from "../models/gameSessionState";
import {GameTurnState} from "../models/gameTurnState";
import {AppCtx} from "../appContext";
import {useSingletonEntity} from "../shared/db/adapters/databaseHooks";

export class GameSessionDatabase extends AbstractSingletonDatabase<GameSession> {

    constructor() {
        super({
            state: "none",
            turnState: "playing",
            turn: -1,
            config: null,
        });
    }

    public setState(state: "none" | "loading" | "playing" | "error") {
        this.update(() => ({
            state: state,
        }));
    }

    public getState(): "none" | "loading" | "playing" | "error" {
        return this.get().state;
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

    public getTurn(): number {
        return this.get().turn;
    }

    public setConfig(config: GameConfig | null) {
        this.update(() => ({
            config: config,
        }));
    }


    public getGameConfig(): GameConfig {
        const config = this.get().config;
        if (config !== null) {
            return config;
        } else {
            throw new Error("No config present");
        }
    }

}

export namespace GameSessionDatabase {

    export function useGameSessionState(): GameSessionState {
        return useSingletonEntity(AppCtx.GameSessionDatabase()).state;
    }

    export function useGameTurnState(): GameTurnState {
        return useSingletonEntity(AppCtx.GameSessionDatabase()).turnState;
    }

    export function useSetGameTurnState(): (state: GameTurnState) => void {
        const db = AppCtx.GameSessionDatabase()
        return (state: GameTurnState) => {
            db.setTurnState(state);
        };
    }

}

