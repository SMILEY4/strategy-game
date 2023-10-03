import {BuildingType} from "./buildingType";

export interface ProductionQueueEntry {
    type: "building" | "settler"
    entryId: string,
    progress: number
}

export interface BuildingProductionQueueEntry extends ProductionQueueEntry {
    type: "building"
    buildingType: BuildingType;
}

export interface SettlerProductionQueueEntry extends ProductionQueueEntry {
    type: "settler"
}