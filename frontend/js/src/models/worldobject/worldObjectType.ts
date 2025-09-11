export class WorldObjectType {

    public static readonly SCOUT = new WorldObjectType("scout", "/icons/worldobjects/unit_scout.png");
    public static readonly SETTLER = new WorldObjectType("settler", "/icons/worldobjects/unit_settler.png");

    public static fromString(id: string): WorldObjectType {
        if (id === WorldObjectType.SETTLER.id) return WorldObjectType.SETTLER;
        if (id === WorldObjectType.SCOUT.id) return WorldObjectType.SCOUT;
        throw new Error("Unknown WorldObjectType ID: " + id);
    }

    readonly id: string;
    readonly icon: string;

    private constructor(id: string, icon: string) {
        this.id = id;
        this.icon = icon;
    }

}