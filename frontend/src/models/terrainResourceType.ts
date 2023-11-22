import {Color} from "./color";

export type TerrainResourceTypeString =
    | "PLAINS"
    | "FOREST"
    | "FISH"
    | "STONE"
    | "METAL"

export class TerrainResourceType {

    public static readonly PLAINS = new TerrainResourceType("PLAINS", "Plains", "/icons/resources/food.png", {red: 153, green: 227, blue: 136});
    public static readonly FOREST = new TerrainResourceType("FOREST", "Forest", "/icons/resources/wood.png", {red: 37, green: 128, blue: 51});
    public static readonly FISH = new TerrainResourceType("FISH", "Fish", "/icons/resources/fish.png", {red: 46, green: 178, blue: 255});
    public static readonly STONE = new TerrainResourceType("STONE", "Stone", "/icons/resources/stone.png", {red: 70, green: 70, blue: 70});
    public static readonly METAL = new TerrainResourceType("METAL", "Metal", "/icons/resources/metal.png", {red: 145, green: 156, blue: 154});

    private static readonly values = [
        TerrainResourceType.PLAINS,
        TerrainResourceType.FOREST,
        TerrainResourceType.FISH,
        TerrainResourceType.STONE,
        TerrainResourceType.METAL,
    ];

    public static getValues(): TerrainResourceType[] {
        return TerrainResourceType.values;
    }

    public static fromString(value: TerrainResourceTypeString): TerrainResourceType {
        switch (value) {
            case "PLAINS":
                return TerrainResourceType.PLAINS;
            case "FOREST":
                return TerrainResourceType.FOREST;
            case "FISH":
                return TerrainResourceType.FISH;
            case "STONE":
                return TerrainResourceType.STONE;
            case "METAL":
                return TerrainResourceType.METAL;

        }
    }


    readonly id: TerrainResourceTypeString;
    readonly displayString: string;
    readonly icon: string;
    readonly color: Color;


    private constructor(id: TerrainResourceTypeString, displayString: string, icon: string, color: Color) {
        this.id = id;
        this.displayString = displayString;
        this.icon = icon;
        this.color = color;
    }
}