import {TileIdentifier} from "./tile";
import {CityIdentifier, ProductionEntry} from "./city";

export type CommandType = "production-queue-entry.add"
    | "production-queue-entry.cancel"
    | "scout.place"
    | "settlement.create"
    | "settlement.upgrade"

export interface Command {
    id: string,
    type: CommandType,
}

export interface CreateSettlementCommand extends Command {
    type: "settlement.create",
    tile: TileIdentifier,
    name: string,
    asColony: boolean
}


export interface UpgradeSettlementCommand extends Command {
    type: "settlement.upgrade",
    settlement: CityIdentifier,
    currTier: number,
    tgtTier: number
}


export interface ProductionQueueAddCommand extends Command {
    type: "production-queue-entry.add",
    city: CityIdentifier,
    entry: ProductionEntry
}


export interface ProductionQueueCancelCommand extends Command {
    type: "production-queue-entry.cancel",
    city: CityIdentifier,
    entryId: string,
}


export interface PlaceScoutCommand extends Command {
    type: "scout.place",
    tile: TileIdentifier,
}