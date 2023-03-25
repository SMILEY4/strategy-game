import {BuildingType} from "./buildingType";

export interface Command {
    commandType: "place-marker" | "place-scout" | "create-city" | "production-queue-add-entry";
    cost: {
        money: number,
        wood: number,
        food: number,
        stone: number,
        metal: number
    };
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

export interface CommandProductionQueueAddEntry extends Command {
    commandType: "production-queue-add-entry"
    cityId: string,
    buildingType: BuildingType
}