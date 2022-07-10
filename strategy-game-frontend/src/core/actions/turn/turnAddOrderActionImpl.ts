import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {CommandPlaceMarker} from "../../../models/commandPlaceMarker";

export class TurnAddOrderAction {

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