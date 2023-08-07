import {GameRepository} from "../required/gameRepository";
import {TilePicker} from "../tilemap/tilePicker";

/**
 * Handles a mouse-movement
 */
export class InputMouseMoveAction {

    private readonly tilePicker: TilePicker;
    private readonly gameRepository: GameRepository;


    constructor(tilePicker: TilePicker, gameRepository: GameRepository) {
        this.tilePicker = tilePicker;
        this.gameRepository = gameRepository;
    }


    perform(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean): void {
        this.updateCamera(leftBtnDown, dx, dy);
        this.updateMouseOverTile(x, y);
    }


    private updateCamera(leftBtnDown: boolean, dx: number, dy: number) {
        if (leftBtnDown) {
            const camera = this.gameRepository.getCamera();
            const x = camera.x + dx / camera.zoom;
            const y = camera.y - dy / camera.zoom;
            this.gameRepository.setCameraPosition(x, y);
        }
    }


    private updateMouseOverTile(x: number, y: number) {
        const tile = this.tilePicker.tileAt(x, y);
        if (tile) {
            this.gameRepository.setMouseOverTile(tile.position.q, tile.position.r);
        } else {
            this.gameRepository.clearMouseOverTile();
        }
    }

}