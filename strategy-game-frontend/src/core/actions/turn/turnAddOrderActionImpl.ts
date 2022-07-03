import {CommandPlaceMarker} from "../../../ports/models/commandPlaceMarker";
import {TurnAddOrderAction} from "../../../ports/provided/turn/turnAddOrderAction";
import {GameStateAccess} from "../../../ports/required/state/gameStateAccess";

export class TurnAddOrderActionImpl implements TurnAddOrderAction {

    private readonly gameStateAccess: GameStateAccess;

    constructor(gameStateAccess: GameStateAccess) {
        this.gameStateAccess = gameStateAccess;
    }


    perform(order: CommandPlaceMarker): void {
        console.debug("Adding order: place marker");
        if (this.gameStateAccess.getCurrentState() == "active") {
            this.gameStateAccess.addCommand(order);
        }
    }

}