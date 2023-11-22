export type TerrainTypeString = "LAND" | "WATER" | "MOUNTAIN"

export class TerrainType {

    public static readonly LAND = new TerrainType("LAND", 3, "Land");
    public static readonly WATER = new TerrainType("WATER", 0, "Water");
    public static readonly MOUNTAIN = new TerrainType("MOUNTAIN", 2, "Mountain");


    public static fromString(value: TerrainTypeString): TerrainType {
        switch (value) {
            case "LAND":
                return TerrainType.LAND;
            case "WATER":
                return TerrainType.WATER;
            case "MOUNTAIN":
                return TerrainType.MOUNTAIN;
        }
    }

    readonly id: TerrainTypeString;
    readonly renderId: number;
    readonly displayString: string;


    constructor(id: TerrainTypeString, renderId: number, displayString: string) {
        this.id = id;
        this.displayString = displayString;
        this.renderId = renderId;
    }
}