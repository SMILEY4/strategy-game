import {CityIdentifier, ProductionEntry} from "../../models/city";
import {TileIdentifier} from "../../models/tile";
import {UID} from "../../shared/uid";
import {
    CreateSettlementCommand,
    PlaceScoutCommand,
    ProductionQueueAddCommand,
    ProductionQueueCancelCommand,
    UpgradeSettlementCommand,
} from "../../models/command";
import {SettlementTier} from "../../models/settlementTier";
import {CommandRepository} from "../../state/access/CommandRepository";

export class CommandService {

    private readonly commandRepository: CommandRepository;

    constructor(commandRepository: CommandRepository) {
        this.commandRepository = commandRepository;
    }

    public cancelCommand(id: string) {
        this.commandRepository.removeCommand(id);
    }

    public createSettlement(tile: TileIdentifier, name: string, asColony: boolean) {
        const command: CreateSettlementCommand = {
            id: UID.generate(),
            type: "settlement.create",
            tile: tile,
            name: name,
            asColony,
        };
        this.commandRepository.addCommand(command);
    }

    public upgradeSettlementTier(settlement: CityIdentifier, currTier: SettlementTier, tgtTier: SettlementTier) {
        const command: UpgradeSettlementCommand = {
            id: UID.generate(),
            type: "settlement.upgrade",
            settlement: settlement,
            currTier: currTier.level,
            tgtTier: tgtTier.level,
        };
        this.commandRepository.addCommand(command);
    }

    public addProductionQueueEntry(city: CityIdentifier, entry: ProductionEntry) {
        const command: ProductionQueueAddCommand = {
            id: UID.generate(),
            type: "production-queue-entry.add",
            city: city,
            entry: entry,
        };
        this.commandRepository.addCommand(command);
    }

    public cancelProductionQueueEntry(city: CityIdentifier, entryId: string) {
        const command: ProductionQueueCancelCommand = {
            id: UID.generate(),
            type: "production-queue-entry.cancel",
            city: city,
            entryId: entryId,
        };
        this.commandRepository.addCommand(command);
    }

    public placeScout(tile: TileIdentifier) {
        const command: PlaceScoutCommand = {
            id: UID.generate(),
            type: "scout.place",
            tile: tile,
        };
        this.commandRepository.addCommand(command);
    }

}