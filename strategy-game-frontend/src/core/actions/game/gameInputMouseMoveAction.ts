import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {TilePicker} from "../../service/tilemap/tilePicker";

export class GameInputMouseMoveAction {

    private readonly tilePicker: TilePicker;
    private readonly gameStateAccess: GameStateAccess;

    constructor(tilePicker: TilePicker, gameStateAccess: GameStateAccess) {
        this.tilePicker = tilePicker;
        this.gameStateAccess = gameStateAccess;
    }

    perform(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean): void {
        if (leftBtnDown) {
            this.gameStateAccess.moveCamera(dx, dy);
        }
        const tile = this.tilePicker.tileAt(x, y);
        if (tile) {
            this.gameStateAccess.setTileMouseOver(tile.q, tile.r);
        } else {
            this.gameStateAccess.clearTileMouseOver();
        }
    }

}