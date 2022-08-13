import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {Command} from "../../../models/state/command";
import {GameState} from "../../../models/state/gameState";

/**
 * Add a command - all added commands will be submitted at the end of the turn
 */
export class TurnAddCommandAction {

    private readonly localGameStateAccess: LocalGameStateAccess;

    constructor(gameStateAccess: LocalGameStateAccess) {
        this.localGameStateAccess = gameStateAccess;
    }

    perform(command: Command): void {
        console.log("add command", command)
        if (this.localGameStateAccess.getCurrentState() == GameState.PLAYING) {
            this.localGameStateAccess.addCommand(command);
        }
    }

}