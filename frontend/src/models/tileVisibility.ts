export type TileVisibilityString = "UNKNOWN" | "DISCOVERED" | "VISIBLE"

export class TileVisibility {

    public static readonly UNKNOWN = new TileVisibility("UNKNOWN", 0, "Unknown");
    public static readonly DISCOVERED = new TileVisibility("DISCOVERED", 1, "Discovered");
    public static readonly VISIBLE = new TileVisibility("VISIBLE", 2, "Visible");

    public static fromString(value: TileVisibilityString): TileVisibility {
        switch (value) {
            case "UNKNOWN":
                return TileVisibility.UNKNOWN;
            case "DISCOVERED":
                return TileVisibility.DISCOVERED;
            case "VISIBLE":
                return TileVisibility.VISIBLE;
        }
    }

    readonly id: TileVisibilityString;
    readonly renderId: number;
    readonly displayString: string;


    constructor(id: TileVisibilityString, renderId: number, displayString: string) {
        this.id = id;
        this.renderId = renderId;
        this.displayString = displayString;
    }
}