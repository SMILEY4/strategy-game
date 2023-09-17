import {CityIdentifier, ProductionEntry} from "../../models/city";
import {GameRepository} from "./gameRepository";
import {TileIdentifier} from "../../models/tile";
import {UID} from "../../shared/uid";
import {
    CreateSettlementCommand,
    PlaceScoutCommand,
    ProductionQueueAddCommand,
    ProductionQueueCancelCommand,
    UpgradeSettlementCommand,
} from "../../models/command";

export class CommandService {

    private readonly gameRepository: GameRepository;

    constructor(gameRepository: GameRepository) {
        this.gameRepository = gameRepository;
    }

    cancelCommand(id: string) {
        this.gameRepository.removeCommand(id);
    }

    createSettlement(tile: TileIdentifier, name: string, asColony: boolean) {
        const command: CreateSettlementCommand = {
            id: UID.generate(),
            type: "settlement.create",
            tile: tile,
            name: name,
            asColony,
        };
        this.gameRepository.addCommand(command);
    }

    upgradeSettlementTier(settlement: CityIdentifier, currTier: number, tgtTier: number) {
        const command: UpgradeSettlementCommand = {
            id: UID.generate(),
            type: "settlement.upgrade",
            settlement: settlement,
            currTier: currTier,
            tgtTier: tgtTier,
        };
        this.gameRepository.addCommand(command);
    }

    addProductionQueueEntry(city: CityIdentifier, entry: ProductionEntry) {
        const command: ProductionQueueAddCommand = {
            id: UID.generate(),
            type: "production-queue-entry.add",
            city: city,
            entry: entry,
        };
        this.gameRepository.addCommand(command);
    }

    cancelProductionQueueEntry(city: CityIdentifier, entryId: string) {
        const command: ProductionQueueCancelCommand = {
            id: UID.generate(),
            type: "production-queue-entry.cancel",
            city: city,
            entryId: entryId
        };
        this.gameRepository.addCommand(command);
    }

    placeScout(tile: TileIdentifier) {
        const command: PlaceScoutCommand = {
            id: UID.generate(),
            type: "scout.place",
            tile: tile,
        };
        this.gameRepository.addCommand(command);
    }

}