import {UiStore} from "../../../external/state/ui/uiStore";
import {GameInputClickAction} from "../../../ports/provided/game/gameInputClickAction";
import {GameStateAccess} from "../../../ports/required/state/gameStateAccess";
import {MenuOther} from "../../../ui/pages/game/ui/MenuOther";
import {MenuSelectedTile} from "../../../ui/pages/game/ui/MenuSelectedTile";
import {TilePicker} from "../../service/tilemap/tilePicker";
import openDialog = UiStore.openDialog;

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
            this.gameStateAccess.setTileSelected(tile.q, tile.r);
            openDialog("topbar.category.menu", 10, 50, 320, 650, (
                <MenuSelectedTile/>
            ));
        } else {
            this.gameStateAccess.clearTileSelected();
        }
    }

}