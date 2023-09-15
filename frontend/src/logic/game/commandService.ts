import {CityIdentifier, ProductionEntry} from "../../models/city";
import {GameRepository} from "./gameRepository";
import {TileIdentifier} from "../../models/tile";
import {UID} from "../../shared/uid";

export class CommandService {

    private readonly gameRepository: GameRepository;

    constructor(gameRepository: GameRepository) {
        this.gameRepository = gameRepository;
    }

    cancelCommand(id: string) {
        this.gameRepository.removeCommand(id);
    }

    createSettlement(tile: TileIdentifier, name: string, asColony: boolean) {
        this.gameRepository.addCommand({
            id: UID.generate(),
            type: "settlement.create", // todo
        });
    }

    upgradeSettlementTier(settlement: CityIdentifier) {
        this.gameRepository.addCommand({
            id: UID.generate(),
            type: "settlement.upgrade", // todo
        });
    }

    addProductionQueueEntry(cityId: string, entry: ProductionEntry) {
        this.gameRepository.addCommand({
            id: UID.generate(),
            type: "production-queue-entry.add", // todo
        });
    }

    cancelProductionQueueEntry(cityId: string) {
        this.gameRepository.addCommand({
            id: UID.generate(),
            type: "production-queue-entry.cancel", // todo
        });
    }

    placeScout(tile: TileIdentifier) {
        this.gameRepository.addCommand({
            id: UID.generate(),
            type: "scout.place", // todo
        });
    }

}