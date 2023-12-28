import {GameConfig} from "./gameConfig";

export interface GameSession {
    state: "none" | "loading" | "playing" | "error",
    turnState: "playing" | "waiting"
    config: GameConfig | null,
    turn: number
}