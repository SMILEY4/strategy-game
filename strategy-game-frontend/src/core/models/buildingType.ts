export enum BuildingType {
    ARMOR_SMITH = "ARMOR_SMITH",
    CATTLE_FARM = "CATTLE_FARM",
    COOPER = "COOPER",
    FARM = "FARM",
    FISHERS_HUT = "FISHERS_HUT",
    JEWELLER = "JEWELLER",
    MARKET = "MARKET",
    MINE = "MINE",
    PARCHMENTERS_WORKSHOP = "PARCHMENTERS_WORKSHOP",
    QUARRY = "QUARRY",
    SHEEP_FARM = "SHEEP_FARM",
    STABLES = "STABLES",
    TAILORS_WORKSHOP = "TAILORS_WORKSHOP",
    TOOLMAKER = "TOOLMAKER",
    WEAPON_SMITH = "WEAPON_SMITH",
    WINERY = "WINERY",
    WOODCUTTER = "WOODCUTTER",
}

export namespace BuildingType {

    export function fromString(str: string): BuildingType {
        if(str === "ARMOR_SMITH") return BuildingType.ARMOR_SMITH;
        if(str === "CATTLE_FARM") return BuildingType.CATTLE_FARM;
        if(str === "COOPER") return BuildingType.COOPER;
        if(str === "FARM") return BuildingType.FARM;
        if(str === "FISHERS_HUT") return BuildingType.FISHERS_HUT;
        if(str === "JEWELLER") return BuildingType.JEWELLER;
        if(str === "MARKET") return BuildingType.MARKET;
        if(str === "MINE") return BuildingType.MINE;
        if(str === "PARCHMENTERS_WORKSHOP") return BuildingType.PARCHMENTERS_WORKSHOP;
        if(str === "QUARRY") return BuildingType.QUARRY;
        if(str === "SHEEP_FARM") return BuildingType.SHEEP_FARM;
        if(str === "STABLES") return BuildingType.STABLES;
        if(str === "TAILORS_WORKSHOP") return BuildingType.TAILORS_WORKSHOP;
        if(str === "TOOLMAKER") return BuildingType.TOOLMAKER;
        if(str === "WEAPON_SMITH") return BuildingType.WEAPON_SMITH;
        if(str === "WINERY") return BuildingType.WINERY;
        if(str === "WOODCUTTER") return BuildingType.WOODCUTTER;
        throw new Error("Unknown building type: " + str);
    }

}
