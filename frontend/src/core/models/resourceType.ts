export enum ResourceType {
    ARMOR = "ARMOR",
    BARRELS = "BARRELS",
    CLOTHES = "CLOTHES",
    FOOD = "FOOD",
    HIDE = "HIDE",
    HORSE = "HORSE",
    JEWELLERIES = "JEWELLERIES",
    METAL = "METAL",
    PARCHMENT = "PARCHMENT",
    STONE = "STONE",
    TOOLS = "TOOLS",
    WEAPONS = "WEAPONS",
    WINE = "WINE",
    WOOD = "WOOD",
}

export namespace ResourceType {

    export const ALL: ResourceType[] = [
        ResourceType.ARMOR,
        ResourceType.BARRELS,
        ResourceType.CLOTHES,
        ResourceType.FOOD,
        ResourceType.HIDE,
        ResourceType.HORSE,
        ResourceType.JEWELLERIES,
        ResourceType.METAL,
        ResourceType.PARCHMENT,
        ResourceType.STONE,
        ResourceType.TOOLS,
        ResourceType.WEAPONS,
        ResourceType.WINE,
        ResourceType.WOOD,
    ]

    export function fromString(str: string): ResourceType {
        const resource = ResourceType.ALL.find(res => res.toString() === str)
        if(!resource) {
            throw Error("Unknown resource type: " + str)
        }
        return resource
    }

}