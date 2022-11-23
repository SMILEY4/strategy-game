import {BuildingType} from "./buildingType";

export interface Command {
    commandType: "place-marker"  | "place-scout" | "create-city" | "create-building";
    cost: {
        money: number,
        wood: number,
        food: number,
        stone: number,
        metal: number
    }
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

export interface CommandCreateBuilding extends Command {
    commandType: "create-building"
    cityId: string,
    buildingType: BuildingType
}