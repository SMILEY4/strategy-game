import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {Command} from "../../../models/state/command";
import {GameState} from "../../../models/state/gameState";

/**
 * Add a command - all added commands will be submitted at the end of the turn
 */
export class TurnAddCommandAction {

    private readonly gameStateAccess: LocalGameStateAccess;

    constructor(gameStateAccess: LocalGameStateAccess) {
        this.gameStateAccess = gameStateAccess;
    }

    perform(command: Command): void {
        console.log("add command", command)
        if (this.gameStateAccess.getCurrentState() == GameState.PLAYING) {
            this.gameStateAccess.addCommand(command);
        }
    }

}