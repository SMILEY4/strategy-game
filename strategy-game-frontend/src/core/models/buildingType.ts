export enum BuildingType {
    LUMBER_CAMP = "LUMBER_CAMP",
    MINE = "MINE",
    QUARRY = "QUARRY",
    HARBOR = "HARBOR",
    FARM = "FARM"
}

export namespace BuildingType {

    export function fromString(str: string): BuildingType {
        if (str === "LUMBER_CAMP") {
            return BuildingType.LUMBER_CAMP;
        }
        if (str === "MINE") {
            return BuildingType.MINE;
        }
        if (str === "QUARRY") {
            return BuildingType.QUARRY;
        }
        if (str === "HARBOR") {
            return BuildingType.HARBOR;
        }
        if (str === "FARM") {
            return BuildingType.FARM;
        }
        throw new Error("Unknown building type: " + str);
    }

}
