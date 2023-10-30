import {BuildingType} from "./buildingType";

export interface ConstructionEntryView {
    entry: ConstructionEntry,
    disabled: boolean,
    queueCount: number
}

export abstract class ConstructionEntry {
    readonly id: string;
    readonly displayString: string;
    readonly icon: string;

    protected constructor(id: string, icon: string, displayString: string) {
        this.id = id;
        this.icon = icon;
        this.displayString = displayString;
    }
}


export class SettlerConstructionEntry extends ConstructionEntry {
    constructor() {
        super("settler", "/icons/buildings/farm.png", "Settler");
    }
}

export class BuildingConstructionEntry extends ConstructionEntry {

    readonly buildingType: BuildingType;

    constructor(type: BuildingType) {
        super(type.id, type.icon, type.displayString);
        this.buildingType = type;
    }

}
