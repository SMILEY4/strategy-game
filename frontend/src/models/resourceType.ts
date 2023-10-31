export type ResourceTypeString = "ARMOR"
    | "BARRELS"
    | "CLOTHES"
    | "FOOD"
    | "HIDE"
    | "HORSE"
    | "JEWELLERIES"
    | "METAL"
    | "PARCHMENT"
    | "STONE"
    | "TOOLS"
    | "WEAPONS"
    | "WINE"
    | "WOOD"

export class ResourceType {

    public static readonly ARMOR = new ResourceType("ARMOR", "Armor", "/icons/resources/armor.png");
    public static readonly BARRELS = new ResourceType("BARRELS", "Barrels", "/icons/resources/barrel.png");
    public static readonly CLOTHES = new ResourceType("CLOTHES", "Clothes", "/icons/resources/clothes.png");
    public static readonly FOOD = new ResourceType("FOOD", "Food", "/icons/resources/food.png");
    public static readonly HIDE = new ResourceType("HIDE", "Hide", "/icons/resources/hide.png");
    public static readonly HORSE = new ResourceType("HORSE", "Horses", "/icons/resources/horse.png");
    public static readonly JEWELLERIES = new ResourceType("JEWELLERIES", "Jewelleries", "/icons/resources/jewelleries.png");
    public static readonly METAL = new ResourceType("METAL", "metal", "/icons/resources/metal.png");
    public static readonly PARCHMENT = new ResourceType("PARCHMENT", "Parchment", "/icons/resources/parchment.png");
    public static readonly STONE = new ResourceType("STONE", "Stone", "/icons/resources/stone.png");
    public static readonly TOOLS = new ResourceType("TOOLS", "Tools", "/icons/resources/tools.png");
    public static readonly WEAPONS = new ResourceType("WEAPONS", "Weapons", "/icons/resources/weapon.png");
    public static readonly WINE = new ResourceType("WINE", "Wine", "/icons/resources/wine.png");
    public static readonly WOOD = new ResourceType("WOOD", "Wood", "/icons/resources/wood.png");

    private static readonly values = [
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
    ];

    public static getValues(): ResourceType[] {
        return ResourceType.values;
    }

    public static fromString(value: ResourceTypeString): ResourceType {
        switch (value) {
            case "ARMOR":
                return ResourceType.ARMOR;
            case "BARRELS":
                return ResourceType.BARRELS;
            case "CLOTHES":
                return ResourceType.CLOTHES;
            case "FOOD":
                return ResourceType.FOOD;
            case "HIDE":
                return ResourceType.HIDE;
            case "HORSE":
                return ResourceType.HORSE;
            case "JEWELLERIES":
                return ResourceType.JEWELLERIES;
            case "METAL":
                return ResourceType.METAL;
            case "PARCHMENT":
                return ResourceType.PARCHMENT;
            case "STONE":
                return ResourceType.STONE;
            case "TOOLS":
                return ResourceType.TOOLS;
            case "WEAPONS":
                return ResourceType.WEAPONS;
            case "WINE":
                return ResourceType.WINE;
            case "WOOD":
                return ResourceType.WOOD;
        }
    }


    readonly id: ResourceTypeString;
    readonly displayString: string;
    readonly icon: string;


    private constructor(id: ResourceTypeString, displayString: string, icon: string) {
        this.id = id;
        this.displayString = displayString;
        this.icon = icon;
    }
}