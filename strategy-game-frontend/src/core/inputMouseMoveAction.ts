import {LocalGameStateAccess} from "../external/state/localgame/localGameStateAccess";
import {TilePicker} from "./tilemap/tilePicker";

/**
 * Handles a mouse-movement
 */
export class InputMouseMoveAction {

    private readonly tilePicker: TilePicker;
    private readonly gameStateAccess: LocalGameStateAccess;


    constructor(tilePicker: TilePicker, gameStateAccess: LocalGameStateAccess) {
        this.tilePicker = tilePicker;
        this.gameStateAccess = gameStateAccess;
    }


    perform(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean): void {
        this.updateCamera(leftBtnDown, dx, dy);
        this.updateMouseOverTile(x, y);
    }


    private updateCamera(leftBtnDown: boolean, dx: number, dy: number) {
        if (leftBtnDown) {
            const camera = this.gameStateAccess.getCamera();
            const x = camera.x + dx / camera.zoom;
            const y = camera.y - dy / camera.zoom;
            this.gameStateAccess.setCameraPosition(x, y);
        }
    }


    private updateMouseOverTile(x: number, y: number) {
        const tile = this.tilePicker.tileAt(x, y);
        if (tile) {
            this.gameStateAccess.setMouseOverTile(tile.position.q, tile.position.r);
        } else {
            this.gameStateAccess.clearMouseOverTile();
        }
    }

}