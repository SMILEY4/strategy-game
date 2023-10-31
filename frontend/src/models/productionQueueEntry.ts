import {BuildingType} from "./buildingType";
import {AddProductionQueueCommand} from "./command";


export interface ProductionQueueEntryView {
    entry: ProductionQueueEntry,
    command: AddProductionQueueCommand | null,
}


export abstract class ProductionQueueEntry {
    readonly id: string;
    readonly progress: number;
    readonly icon: string;
    readonly displayName: string;

    protected constructor(id: string, progress: number, displayName: string, icon: string) {
        this.id = id;
        this.progress = progress;
        this.displayName = displayName;
        this.icon = icon;
    }
}


export class SettlerProductionQueueEntry extends ProductionQueueEntry {
    constructor(id: string, progress: number) {
        super(id, progress, "Settler", "/icons/buildings/farm.png");
    }
}


export class BuildingProductionQueueEntry extends ProductionQueueEntry {
    readonly buildingType: BuildingType;

    constructor(id: string, progress: number, buildingType: BuildingType) {
        super(id, progress, buildingType.displayString, buildingType.icon);
        this.buildingType = buildingType;
    }
}