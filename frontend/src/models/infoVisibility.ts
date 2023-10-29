export class InfoVisibility {

    public static readonly UNKNOWN = new InfoVisibility("unknown");
    public static readonly KNOWN = new InfoVisibility("known");
    public static readonly UNCERTAIN = new InfoVisibility("uncertain");

    readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

}