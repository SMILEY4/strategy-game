import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {CommandCreateCity} from "../../../models/commandCreateCity";
import {CommandPlaceMarker} from "../../../models/commandPlaceMarker";

export class TurnAddCommandAction {

    private readonly gameStateAccess: GameStateAccess;

    constructor(gameStateAccess: GameStateAccess) {
        this.gameStateAccess = gameStateAccess;
    }


    perform(command: CommandPlaceMarker | CommandCreateCity): void {
        console.debug("Adding command:", command.commandType);
        if (this.gameStateAccess.getCurrentState() == "active") {
            this.gameStateAccess.addCommand(command);
        }
    }

}