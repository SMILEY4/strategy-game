import {BuildingType} from "./models/buildingType";
import {
    Command,
    CommandCreateCity,
    CommandPlaceMarker,
    CommandPlaceScout,
    CommandProductionQueueAddBuildingEntry,
    CommandProductionQueueAddSettlerEntry,
    CommandUpgradeSettlementTier,
} from "./models/command";
import {GameState} from "./models/gameState";
import {TilePosition} from "./models/tilePosition";
import {GameConfigRepository} from "./required/gameConfigRepository";
import {GameRepository} from "./required/gameRepository";

/**
 * Add a command - all added commands will be submitted at the end of the turn
 */
export class TurnAddCommandAction {

    private readonly gameRepository: GameRepository;
    private readonly gameConfigRepository: GameConfigRepository;

    constructor(gameRepository: GameRepository, gameConfigRepository: GameConfigRepository) {
        this.gameRepository = gameRepository;
        this.gameConfigRepository = gameConfigRepository;
    }

    perform(command: Command): void {
        console.log("add command", command);
        if (this.gameRepository.getGameState() == GameState.PLAYING) {
            this.gameRepository.addCommand(command);
        }
    }

    addPlaceMarker(tilePos: TilePosition) {
        this.perform({
            commandType: "place-marker",
            q: tilePos.q,
            r: tilePos.r,
        } as CommandPlaceMarker);
    }

    addPlaceScout(tilePos: TilePosition) {
        this.perform({
            commandType: "place-scout",
            q: tilePos.q,
            r: tilePos.r,
        } as CommandPlaceScout);
    }

    addCreateCity(tilePos: TilePosition, name: string, withNewProvince: boolean) {
        this.perform({
            commandType: "create-city",
            q: tilePos.q,
            r: tilePos.r,
            name: name,
            withNewProvince: withNewProvince,
        } as CommandCreateCity);
    }

    addCreateBuilding(cityId: string, buildingType: BuildingType) {
        this.perform({
            commandType: "production-queue-add-entry.building",
            cityId: cityId,
            buildingType: buildingType,
        } as CommandProductionQueueAddBuildingEntry);
    }

    addCreateSettler(cityId: string) {
        this.perform({
            commandType: "production-queue-add-entry.settler",
            cityId: cityId,
        } as CommandProductionQueueAddSettlerEntry);
    }

    addUpgradeSettlementTier(cityId: string) {
        this.perform({
            commandType: "upgrade-settlement-tier",
            cityId: cityId,
        } as CommandUpgradeSettlementTier);
    }

}