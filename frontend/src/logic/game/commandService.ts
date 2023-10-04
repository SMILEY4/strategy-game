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
import {CommandStateAccess} from "../../state/access/CommandStateAccess";

export class CommandService {

    cancelCommand(id: string) {
        CommandStateAccess.removeCommand(id);
    }

    createSettlement(tile: TileIdentifier, name: string, asColony: boolean) {
        const command: CreateSettlementCommand = {
            id: UID.generate(),
            type: "settlement.create",
            tile: tile,
            name: name,
            asColony,
        };
        CommandStateAccess.addCommand(command);
    }

    upgradeSettlementTier(settlement: CityIdentifier, currTier: number, tgtTier: number) {
        const command: UpgradeSettlementCommand = {
            id: UID.generate(),
            type: "settlement.upgrade",
            settlement: settlement,
            currTier: currTier,
            tgtTier: tgtTier,
        };
        CommandStateAccess.addCommand(command);
    }

    addProductionQueueEntry(city: CityIdentifier, entry: ProductionEntry) {
        const command: ProductionQueueAddCommand = {
            id: UID.generate(),
            type: "production-queue-entry.add",
            city: city,
            entry: entry,
        };
        CommandStateAccess.addCommand(command);
    }

    cancelProductionQueueEntry(city: CityIdentifier, entryId: string) {
        const command: ProductionQueueCancelCommand = {
            id: UID.generate(),
            type: "production-queue-entry.cancel",
            city: city,
            entryId: entryId,
        };
        CommandStateAccess.addCommand(command);
    }

    placeScout(tile: TileIdentifier) {
        const command: PlaceScoutCommand = {
            id: UID.generate(),
            type: "scout.place",
            tile: tile,
        };
        CommandStateAccess.addCommand(command);
    }

}