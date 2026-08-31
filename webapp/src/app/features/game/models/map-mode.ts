export class MapMode {

    public static readonly TERRAIN = new MapMode("terrain", 1)
    public static readonly POLITICAL = new MapMode("political", 2)
    public static readonly SETTLEMENT_LOCATIONS = new MapMode("settlement-locations", 3)

    public static readonly ALL: MapMode[] = [
        MapMode.TERRAIN,
        MapMode.POLITICAL,
        MapMode.SETTLEMENT_LOCATIONS,
    ]

    readonly id: string;
    readonly numericId: number

    constructor(id: string, numericId: number) {
        this.id = id;
        this.numericId = numericId;
    }
}