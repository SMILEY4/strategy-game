import {GameInputClickAction} from "../../../ports/provided/game/GameInputClickAction";
import {GameStateAccess} from "../../../ports/required/state/gameStateAccess";
import {TilePicker} from "../../service/tilemap/tilePicker";

export class GameInputClickActionImpl implements GameInputClickAction {

    private readonly tilePicker: TilePicker;
    private readonly gameStateAccess: GameStateAccess;

    constructor(tilePicker: TilePicker, gameStateAccess: GameStateAccess) {
        this.tilePicker = tilePicker;
        this.gameStateAccess = gameStateAccess;
    }

    perform(x: number, y: number): void {
        const tile = this.tilePicker.tileAt(x, y);
        if (tile) {
            this.gameStateAccess.addCommand({
                q: tile.q,
                r: tile.r
            });
        }
    }

}