import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {AppConfig} from "../../../main";
import {Command, CommandCreateCity} from "../../../models/state/command";
import {GameState} from "../../../models/state/gameState";
import {TilePosition} from "../../../models/state/tilePosition";

/**
 * Add a command - all added commands will be submitted at the end of the turn
 */
export class TurnAddCommandAction {

    private readonly localGameStateAccess: LocalGameStateAccess;

    constructor(gameStateAccess: LocalGameStateAccess) {
        this.localGameStateAccess = gameStateAccess;
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

    addCreateCity(tilePos: TilePosition, name: string, provinceId: string | null) {
        this.perform({
            commandType: "create-city",
            cost: {
                money: 50
            },
            q: tilePos.q,
            r: tilePos.r,
            name: name,
            provinceId: provinceId
        } as CommandCreateCity);
    }

}