export enum TileResourceType {
    NONE = "NONE",
    PLAINS = "PLAINS",
    FOREST = "FOREST",
    FISH = "FISH",
    STONE = "STONE",
    METAL = "METAL",
}

export namespace TileResourceType {

    export function fromString(strType: string): TileResourceType {
        if (strType === "NONE") {
            return TileResourceType.NONE;
        }
        if (strType === "PLAINS") {
            return TileResourceType.PLAINS;
        }
        if (strType === "FOREST") {
            return TileResourceType.FOREST;
        }
        if (strType === "FISH") {
            return TileResourceType.FISH;
        }
        if (strType === "STONE") {
            return TileResourceType.STONE;
        }
        if (strType === "METAL") {
            return TileResourceType.METAL;
        }
        throw new Error("Unknown tile resource type: '" + strType + "'");
    }

}