import {GameConfigStateAccess} from "../../../external/state/gameconfig/gameConfigStateAccess";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {Command, CommandCreateCity} from "../../../models/state/command";
import {GameState} from "../../../models/state/gameState";
import {TilePosition} from "../../../models/state/tilePosition";

/**
 * Add a command - all added commands will be submitted at the end of the turn
 */
export class TurnAddCommandAction {

    private readonly localGameStateAccess: LocalGameStateAccess;
    private readonly gameConfig: GameConfigStateAccess;

    constructor(gameStateAccess: LocalGameStateAccess, gameConfig: GameConfigStateAccess) {
        this.localGameStateAccess = gameStateAccess;
        this.gameConfig = gameConfig;
    }

    perform(command: Command): void {
        console.log("add command", command);
        if (this.localGameStateAccess.getCurrentState() == GameState.PLAYING) {
            this.localGameStateAccess.addCommand(command);
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

    addCreateCity(tilePos: TilePosition, name: string) {
        this.perform({
            commandType: "create-city",
            cost: {
                money: this.gameConfig.getGameConfig().cityCost
            },
            q: tilePos.q,
            r: tilePos.r,
            name: name,
        } as CommandCreateCity);
    }

}