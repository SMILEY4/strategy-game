import {CityIdentifier, ProductionEntry} from "../../models/city";
import {GameRepository} from "./gameRepository";
import {TileIdentifier} from "../../models/tile";

export class CommandService {

    private readonly gameRepository: GameRepository;

    constructor(gameRepository: GameRepository) {
        this.gameRepository = gameRepository;
    }

    createSettlement(tile: TileIdentifier, name: string, withNewProvince: boolean) {
        this.gameRepository.addCommand({
            type: "settlement.create", // todo
        });
    }

    upgradeSettlementTier(settlement: CityIdentifier) {
        this.gameRepository.addCommand({
            type: "settlement.upgrade", // todo
        });
    }

    addProductionQueueEntry(cityId: string, entry: ProductionEntry) {
        this.gameRepository.addCommand({
            type: "production-queue-entry.add", // todo
        });
    }

    cancelProductionQueueEntry(cityId: string) {
        this.gameRepository.addCommand({
            type: "production-queue-entry.cancel", // todo
        });
    }

    placeScout(tile: TileIdentifier) {
        this.gameRepository.addCommand({
            type: "scout.place", // todo
        });
    }

}