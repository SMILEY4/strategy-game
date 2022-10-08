import {Command, CommandCreateCity} from "../models/state/command";
import {GameState} from "../models/state/gameState";
import {TilePosition} from "../models/state/tilePosition";
import {GameConfigRepository} from "./required/gameConfigRepository";
import {GameRepository} from "./required/gameRepository";

/**
 * Add a command - all added commands will be submitted at the end of the turn
 */
export class TurnAddCommandAction {

    private readonly gameRepository: GameRepository;
    private readonly gameConfigRepository: GameConfigRepository;

    constructor(gameRepository: GameRepository, gameConfigRepository: GameConfigRepository) {
        this.gameRepository = gameRepository;
        this.gameConfigRepository = gameConfigRepository;
    }

    perform(command: Command): void {
        console.log("add command", command);
        if (this.gameRepository.getGameState() == GameState.PLAYING) {
            this.gameRepository.addCommand(command);
        }
    }

    addPlaceMarker(tilePos: TilePosition) {
        this.perform({
            commandType: "place-marker",
            cost: {
                money: 0
            },
            q: tilePos.q,
            r: tilePos.r
        } as Command);
    }

    addPlaceScout(tilePos: TilePosition) {
        this.perform({
            commandType: "place-scout",
            cost: {
                money: 0
            },
            q: tilePos.q,
            r: tilePos.r
        } as Command);
    }

    addCreateCity(tilePos: TilePosition, name: string, parentCity: string | null) {
        this.perform({
            commandType: "create-city",
            cost: {
                money: this.gameConfigRepository.getConfig().cityCost
            },
            q: tilePos.q,
            r: tilePos.r,
            name: name,
            parentCity: parentCity
        } as CommandCreateCity);
    }
}