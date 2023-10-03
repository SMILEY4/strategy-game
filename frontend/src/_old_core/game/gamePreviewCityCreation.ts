import {GameApi} from "../required/gameApi";
import {GameRepository} from "../required/gameRepository";
import {TilePosition} from "../models/tilePosition";
import {CityCreationPreview} from "../models/CityCreationPreview";

/**
 * Handle the city-creation preview
 */
export class GamePreviewCityCreation {

    private readonly gameApi: GameApi;
    private readonly gameRepository: GameRepository;

    constructor(gameApi: GameApi, gameRepository: GameRepository) {
        this.gameApi = gameApi;
        this.gameRepository = gameRepository;
    }

    showPreview(pos: TilePosition, isProvinceCapital: boolean): void {
        console.log("showing city-creation preview");
        const gameId = this.gameRepository.getGameId();
        this.gameApi.previewCityCreation(gameId, pos, isProvinceCapital).then((preview: CityCreationPreview) => {
            this.gameRepository.setPreviewCityCreation(preview);
        });
    }

    clearPreview() {
        console.log("clearing city-creation preview");
        this.gameRepository.setPreviewCityCreation(null);
    }

}