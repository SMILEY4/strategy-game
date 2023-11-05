export class MapMode {

    public static readonly DEFAULT = new MapMode(0, "Default");
    public static readonly COUNTRIES = new MapMode(1, "Countries");
    public static readonly PROVINCES = new MapMode(2, "Provinces");
    public static readonly CITIES = new MapMode(3, "Cities");
    public static readonly TERRAIN = new MapMode(4, "Terrain");
    public static readonly RESOURCES = new MapMode(5, "Resources");

    private static readonly values = [
        MapMode.DEFAULT,
        MapMode.COUNTRIES,
        MapMode.PROVINCES,
        MapMode.CITIES,
        MapMode.TERRAIN,
        MapMode.RESOURCES,
    ];

    public static getValues(): MapMode[] {
        return MapMode.values;
    }

    readonly id: number;
    readonly displayString: string;

    private constructor(id: number, displayString: string) {
        this.id = id;
        this.displayString = displayString;
    }
}