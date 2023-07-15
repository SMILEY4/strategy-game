export enum TerrainType {
    LAND = "LAND",
    WATER = "WATER",
    MOUNTAIN = "MOUNTAIN"
}

export namespace TerrainType {

    export function fromString(strType: string): TerrainType {
        if (strType === "WATER") {
            return TerrainType.WATER;
        }
        if (strType === "MOUNTAIN") {
            return TerrainType.MOUNTAIN;
        }
        if (strType === "LAND") {
            return TerrainType.LAND;
        }
        throw new Error("Unknown terrain type: '" + strType + "'");
    }

}