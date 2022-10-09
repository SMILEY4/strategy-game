import {Command} from "../../models/state/command";
import {GameConfig} from "../../models/state/gameConfig";

export interface GameApi {
    config: () => Promise<GameConfig>;
    list: () => Promise<string[]>;
    create: () => Promise<string>;
    join: (gameId: string) => Promise<void>;
    connect: (gameId: string) => Promise<void>;
    disconnect: () => void;
    submitTurn: (commands: Command[]) => void;
}