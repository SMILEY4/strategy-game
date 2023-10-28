import {CityIdentifier, ProductionEntry} from "../../models/city";
import {TileIdentifier} from "../../models/tile";
import {SettlementTier} from "../../models/settlementTier";
import {CommandRepository} from "../../state/access/CommandRepository";
import {
    AddProductionQueueCommand,
    CancelProductionQueueCommand,
    CreateCityCommand,
    PlaceScoutCommand,
    UpgradeCityCommand,
} from "../../models/command";

export class CommandService {

    private readonly commandRepository: CommandRepository;

    constructor(commandRepository: CommandRepository) {
        this.commandRepository = commandRepository;
    }

    public cancelCommand(id: string) {
        this.commandRepository.removeCommand(id);
    }

    public createSettlement(tile: TileIdentifier, name: string, asColony: boolean) {
        const command = new CreateCityCommand({
            tile: tile,
            name: name,
            asColony,
        });
        this.commandRepository.addCommand(command);
    }

    public upgradeSettlementTier(city: CityIdentifier, currentTier: SettlementTier, targetTier: SettlementTier) {
        const command = new UpgradeCityCommand({
            city: city,
            currentTier: currentTier.level,
            targetTier: targetTier.level,
        });
        this.commandRepository.addCommand(command);
    }

    public addProductionQueueEntry(city: CityIdentifier, entry: ProductionEntry) {
        const command = new AddProductionQueueCommand({
            city: city,
            entry: entry,
        });
        this.commandRepository.addCommand(command);
    }

    public cancelProductionQueueEntry(city: CityIdentifier, entryId: string) {
        const command = new CancelProductionQueueCommand({
            city: city,
            entryId: entryId,
        });
        this.commandRepository.addCommand(command);
    }

    public placeScout(tile: TileIdentifier) {
        const command = new PlaceScoutCommand({
            tile: tile,
        });
        this.commandRepository.addCommand(command);
    }

}