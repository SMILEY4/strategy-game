import {GameStateAccess} from "../../../external/state/game/gameStateAccess";

export class GameInputMouseScrollAction {

    private readonly gameStateAccess: GameStateAccess;

    constructor(gameStateAccess: GameStateAccess) {
        this.gameStateAccess = gameStateAccess;
    }

    perform(d: number): void {
        this.gameStateAccess.zoomCamera(d > 0 ? 0.1 : -0.1);
    }

}