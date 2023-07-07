import {BuildingType} from "./buildingType";

export interface Command {
    commandType: "place-marker"
        | "place-scout"
        | "create-city"
        | "production-queue-add-entry.building"
        | "production-queue-add-entry.settler"
        | "upgrade-settlement-tier";
}

export interface CommandPlaceMarker extends Command {
    commandType: "place-marker"
    q: number,
    r: number,
}

export interface CommandPlaceScout extends Command {
    commandType: "place-scout"
    q: number,
    r: number,
}

export interface CommandCreateCity extends Command {
    commandType: "create-city"
    name: string,
    q: number,
    r: number,
    withNewProvince: boolean
}

export interface CommandProductionQueueAddBuildingEntry extends Command {
    commandType: "production-queue-add-entry.building"
    cityId: string,
    buildingType: BuildingType
}

export interface CommandProductionQueueAddSettlerEntry extends Command {
    commandType: "production-queue-add-entry.settler"
    cityId: string,
}

export interface CommandUpgradeSettlementTier extends Command {
    commandType: "upgrade-settlement-tier"
    cityId: string,
}