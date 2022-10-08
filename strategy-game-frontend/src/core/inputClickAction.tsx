import {Tile} from "../models/state/tile";
import {GameRepository} from "./required/gameRepository";
import {UIService} from "./required/UIService";
import {TilePicker} from "./tilemap/tilePicker";

/**
 * Handles a mouse-click
 */
export class InputClickAction {

    private readonly tilePicker: TilePicker;
    private readonly gameRepository: GameRepository;
    private readonly uiService: UIService;


    constructor(tilePicker: TilePicker, gameRepository: GameRepository, uiService: UIService) {
        this.tilePicker = tilePicker;
        this.gameRepository = gameRepository;
        this.uiService = uiService;
    }


    perform(x: number, y: number): void {
        const tile = this.tilePicker.tileAt(x, y);
        if (tile) {
            this.clickOnTile(tile);
        } else {
            this.gameRepository.clearSelectedTile();
        }
    }


    private clickOnTile(tile: Tile) {
        this.gameRepository.setSelectedTile(tile.position.q, tile.position.r);
        this.uiService.openMenuSelectedTile;
    }

}