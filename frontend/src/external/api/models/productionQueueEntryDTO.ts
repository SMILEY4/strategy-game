export interface ProductionQueueEntryDTO {
    type: "building" | "settler"
    entryId: string,
    progress: number
}

export interface BuildingProductionQueueEntryDTO extends ProductionQueueEntryDTO {
    buildingType: string;
}

export interface SettlerProductionQueueEntryDTO extends ProductionQueueEntryDTO {
}