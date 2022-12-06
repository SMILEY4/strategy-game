export enum ResourceType {
    NONE = "NONE",
    PLAINS = "PLAINS",
    FOREST = "FOREST",
    FISH = "FISH",
    STONE = "STONE",
    METAL = "METAL",
}

export namespace ResourceType {

    export function fromString(strType: string): ResourceType {
        if (strType === "NONE") {
            return ResourceType.NONE;
        }
        if (strType === "PLAINS") {
            return ResourceType.PLAINS;
        }
        if (strType === "FOREST") {
            return ResourceType.FOREST;
        }
        if (strType === "FISH") {
            return ResourceType.FISH;
        }
        if (strType === "STONE") {
            return ResourceType.STONE;
        }
        if (strType === "METAL") {
            return ResourceType.METAL;
        }
        throw new Error("Unknown resource type: '" + strType + "'");
    }

}