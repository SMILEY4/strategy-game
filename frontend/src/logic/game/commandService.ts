import {CityIdentifier} from "../../models/city";
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
import {ConstructionEntry} from "../../models/constructionEntry";
import {ProductionQueueEntry} from "../../models/productionQueueEntry";

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
            currentTier: currentTier,
            targetTier: targetTier,
        });
        this.commandRepository.addCommand(command);
    }

    public addProductionQueueEntry(city: CityIdentifier, entry: ConstructionEntry) {
        const command = new AddProductionQueueCommand({
            city: city,
            entry: entry,
        });
        this.commandRepository.addCommand(command);
    }

    public cancelProductionQueueEntry(city: CityIdentifier, entry: ProductionQueueEntry) {
        const command = new CancelProductionQueueCommand({
            city: city,
            entry: entry,
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