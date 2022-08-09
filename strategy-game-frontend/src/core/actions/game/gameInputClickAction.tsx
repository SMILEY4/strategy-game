import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {UIStateAccess} from "../../../external/state/ui/uiStateAccess";
import {MenuSelectedTile} from "../../../ui/pages/game/ui/MenuSelectedTile";
import {TilePicker} from "../../service/tilemap/tilePicker";

/**
 * Handles a mouse-click
 */
export class GameInputClickAction {

    private readonly tilePicker: TilePicker;
    private readonly gameStateAccess: LocalGameStateAccess;
    private readonly uiStateAccess: UIStateAccess;

    constructor(tilePicker: TilePicker, gameStateAccess: LocalGameStateAccess, uiStateAccess: UIStateAccess) {
        this.tilePicker = tilePicker;
        this.gameStateAccess = gameStateAccess;
        this.uiStateAccess = uiStateAccess;
    }

    perform(x: number, y: number): void {
        const tile = this.tilePicker.tileAt(x, y);
        if (tile) {
            this.gameStateAccess.setSelectedTile(tile.position.q, tile.position.r);
            this.uiStateAccess.openFrame("topbar.category.menu", 10, 50, 320, 650, (
                <MenuSelectedTile/>
            ));
        } else {
            this.gameStateAccess.clearSelectedTile();
        }
    }

}