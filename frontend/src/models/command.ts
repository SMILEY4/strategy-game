import {CommandType} from "./commandType";
import {UID} from "../shared/uid";
import {TileIdentifier} from "./tile";
import {CityIdentifier, ProductionEntry, ProductionQueueEntry} from "./city";
import {SettlementTier} from "./settlementTier";
import {ConstructionEntry} from "./ConstructionEntry";


export abstract class Command {
    readonly id: string;
    readonly type: CommandType;

    protected constructor(type: CommandType) {
        this.type = type;
        this.id = UID.generate();
    }

}


export class CreateCityCommand extends Command {

    readonly tile: TileIdentifier;
    readonly name: string;
    readonly asColony: boolean;

    constructor(data: { tile: TileIdentifier, name: string, asColony: boolean }) {
        super(CommandType.CITY_CREATE);
        this.tile = data.tile;
        this.name = data.name;
        this.asColony = data.asColony;
    }

}


export class UpgradeCityCommand extends Command {

    readonly city: CityIdentifier;
    readonly currentTier: SettlementTier;
    readonly targetTier: SettlementTier;

    constructor(data: { city: CityIdentifier, currentTier: SettlementTier, targetTier: SettlementTier }) {
        super(CommandType.CITY_UPGRADE);
        this.city = data.city;
        this.currentTier = data.currentTier;
        this.targetTier = data.targetTier;
    }

}


export class AddProductionQueueCommand extends Command {

    readonly city: CityIdentifier;
    readonly entry: ConstructionEntry;

    constructor(data: { city: CityIdentifier, entry: ConstructionEntry }) {
        super(CommandType.PRODUCTION_QUEUE_ADD);
        this.city = data.city;
        this.entry = data.entry;
    }

}


export class CancelProductionQueueCommand extends Command {

    readonly city: CityIdentifier;
    readonly entry: ProductionQueueEntry;

    constructor(data: { city: CityIdentifier, entry: ProductionQueueEntry }) {
        super(CommandType.PRODUCTION_QUEUE_CANCEL);
        this.city = data.city;
        this.entry = data.entry;
    }

}


export class PlaceScoutCommand extends Command {

    readonly tile: TileIdentifier;

    constructor(data: { tile: TileIdentifier }) {
        super(CommandType.SCOUT_PLACE);
        this.tile = data.tile;
    }

}