import {Command} from "../models/command";
import {GameConfig} from "../models/gameConfig";
import {BaseError} from "../../shared/error";
import {TilePosition} from "../models/tilePosition";
import {CityCreationPreview} from "../models/CityCreationPreview";

export interface GameApi {
    config: () => Promise<GameConfig>;
    list: () => Promise<string[]>;
    create: (seed: string | null) => Promise<string>;
    delete: (gameId: string) => Promise<void>;
    join: (gameId: string) => Promise<void>;
    connect: (gameId: string) => Promise<void>;
    disconnect: () => void;
    submitTurn: (commands: Command[]) => void;
    previewCityCreation: (gameId: string, pos: TilePosition, isProvinceCapital: boolean) => Promise<CityCreationPreview>
}

export class GameApiError extends BaseError {
    constructor(errorCode: string, message: string) {
        super(errorCode, message);
    }
}

export class UnauthorizedError extends GameApiError {
    constructor() {
        super("Unauthorized", "The provided email or password is invalid");
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