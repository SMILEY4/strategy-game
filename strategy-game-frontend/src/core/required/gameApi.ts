import {Command} from "../models/command";
import {GameConfig} from "../models/gameConfig";
import {BaseError} from "../../shared/error";

export interface GameApi {
    config: () => Promise<GameConfig>;
    list: () => Promise<string[]>;
    create: (seed: string | null) => Promise<string>;
    join: (gameId: string) => Promise<void>;
    connect: (gameId: string) => Promise<void>;
    disconnect: () => void;
    submitTurn: (commands: Command[]) => void;
}

export class GameApiError extends BaseError {
    constructor(errorCode: string, message: string) {
        super(errorCode, message);
    }
}

export class UserAlreadyPlayerError extends GameApiError {
    constructor() {
        super("UserAlreadyPlayerError", "The user has already joined the game.");
    }
}

export class GameNotFoundError extends GameApiError {
    constructor() {
        super("GameNotFound", "Game could not be found when trying to join it.");
    }
}