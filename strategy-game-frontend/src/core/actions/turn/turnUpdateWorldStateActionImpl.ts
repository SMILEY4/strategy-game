import {TurnUpdateWorldStateAction} from "../../../ports/provided/turn/TurnUpdateWorldStateAction";
import {GameStateAccess} from "../../../ports/required/state/gameStateAccess";
import {WorldStateAccess} from "../../../ports/required/state/worldStateAccess";

export class TurnUpdateWorldStateActionImpl implements TurnUpdateWorldStateAction {

    private readonly gameStateAccess: GameStateAccess;
    private readonly worldStateAccess: WorldStateAccess;

    constructor(gameStateAccess: GameStateAccess, worldStateAccess: WorldStateAccess) {
        this.gameStateAccess = gameStateAccess;
        this.worldStateAccess = worldStateAccess;
    }

    perform(
        tiles: ({
            q: number,
            r: number,
            tileId: number
        })[],
        markers: ({
            q: number,
            r: number,
            userId: string
        })[]
    ): void {
        if(this.gameStateAccess.getCurrentState() !== "active") {
            this.gameStateAccess.setCurrentState("active")
        }
        this.worldStateAccess.setMarkers(markers);
        this.worldStateAccess.setTiles(tiles);
        this.gameStateAccess.setTurnState("active");
        this.gameStateAccess.clearCommands();
    }

}