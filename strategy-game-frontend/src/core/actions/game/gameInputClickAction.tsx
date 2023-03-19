import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {UIStateAccess} from "../../../external/state/ui/uiStateAccess";
import {Tile} from "../../../models/state/tile";
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
            this.clickOnTile(tile);
        } else {
            this.gameStateAccess.clearSelectedTile();
        }
    }


    private clickOnTile(tile: Tile) {
        this.gameStateAccess.setSelectedTile(tile.position.q, tile.position.r);
        this.uiStateAccess.openFrame(
            "topbar.category.menu",
            {
                vertical: {
                    x: 10,
                    width: 320,
                    top: 50,
                    bottom: 10
                }
            },
            () => <MenuSelectedTile/>
        );
    }

}