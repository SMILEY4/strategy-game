import {CityIdentifier} from "../../models/city";
import {TileIdentifier} from "../../models/tile";
import {SettlementTier} from "../../models/settlementTier";
import {
    AddProductionQueueCommand,
    CancelProductionQueueCommand,
    CreateCityCommand,
    PlaceScoutCommand,
    UpgradeCityCommand,
} from "../../models/command";
import {ConstructionEntry} from "../../models/constructionEntry";
import {ProductionQueueEntry} from "../../models/productionQueueEntry";
import {ProvinceIdentifier} from "../../models/province";
import {CommandDatabase} from "../../state_new/commandDatabase";

export class CommandService {

    private readonly commandDb: CommandDatabase;

    constructor(commandDb: CommandDatabase) {
        this.commandDb = commandDb;
    }

    public cancelCommand(id: string) {
        this.commandDb.delete(id)
    }

    public createSettlement(tile: TileIdentifier, name: string, province: ProvinceIdentifier | null) {
        const command = new CreateCityCommand({
            tile: tile,
            name: name,
            province: province,
        });
        this.commandDb.insert(command);
    }

    public upgradeSettlementTier(city: CityIdentifier, currentTier: SettlementTier, targetTier: SettlementTier) {
        const command = new UpgradeCityCommand({
            city: city,
            currentTier: currentTier,
            targetTier: targetTier,
        });
        this.commandDb.insert(command);
    }

    public addProductionQueueEntry(city: CityIdentifier, entry: ConstructionEntry) {
        const command = new AddProductionQueueCommand({
            city: city,
            entry: entry,
        });
        this.commandDb.insert(command);
    }

    public cancelProductionQueueEntry(city: CityIdentifier, entry: ProductionQueueEntry) {
        const command = new CancelProductionQueueCommand({
            city: city,
            entry: entry,
        });
        this.commandDb.insert(command);
    }

    public placeScout(tile: TileIdentifier) {
        const command = new PlaceScoutCommand({
            tile: tile,
        });
        this.commandDb.insert(command);
    }

}