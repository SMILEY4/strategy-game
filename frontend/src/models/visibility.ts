export type VisibilityString = "UNKNOWN" | "DISCOVERED" | "VISIBLE"

export class Visibility {

    public static readonly UNKNOWN = new Visibility("UNKNOWN", 0, "Unknown");
    public static readonly DISCOVERED = new Visibility("DISCOVERED", 1, "Discovered");
    public static readonly VISIBLE = new Visibility("VISIBLE", 2, "Visible");

    public static fromString(value: VisibilityString): Visibility {
        switch (value) {
            case "UNKNOWN":
                return Visibility.UNKNOWN;
            case "DISCOVERED":
                return Visibility.DISCOVERED;
            case "VISIBLE":
                return Visibility.VISIBLE;
        }
    }

    readonly id: VisibilityString;
    readonly renderId: number;
    readonly displayString: string;


    constructor(id: VisibilityString, renderId: number, displayString: string) {
        this.id = id;
        this.renderId = renderId;
        this.displayString = displayString;
    }
}