import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {WorldStateAccess} from "../../../external/state/world/worldStateAccess";

export class TurnUpdateWorldStateAction {

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
        console.debug("Updating world state")
        if(this.gameStateAccess.getCurrentState() !== "active") {
            this.gameStateAccess.setCurrentState("active")
        }
        this.worldStateAccess.setMarkers(markers);
        this.worldStateAccess.setTiles(tiles);
        this.gameStateAccess.setTurnState("active");
        this.gameStateAccess.clearCommands();
    }

}