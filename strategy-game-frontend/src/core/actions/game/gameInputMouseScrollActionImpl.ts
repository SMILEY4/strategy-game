import {GameInputMouseScrollAction} from "../../../ports/provided/game/GameInputMouseScrollAction";
import {GameStateAccess} from "../../../ports/required/state/gameStateAccess";

export class GameInputMouseScrollActionImpl implements GameInputMouseScrollAction {

    private readonly gameStateAccess: GameStateAccess;

    constructor(gameStateAccess: GameStateAccess) {
        this.gameStateAccess = gameStateAccess;
    }

    perform(d: number): void {
        this.gameStateAccess.zoomCamera(d > 0 ? 0.1 : -0.1);
    }

}