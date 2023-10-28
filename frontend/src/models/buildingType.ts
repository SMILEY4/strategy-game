export type BuildingTypeString = "FARM"
    | "FISHERS_HUT"
    | "MINE"
    | "QUARRY"
    | "WOODCUTTER"
    | "CATTLE_FARM"
    | "ARMOR_SMITH"
    | "COOPER"
    | "JEWELLER"
    | "SHEEP_FARM"
    | "STABLES"
    | "TOOLMAKER"
    | "WEAPON_SMITH"
    | "MARKET"
    | "PARCHMENTERS_WORKSHOP"
    | "TAILORS_WORKSHOP"
    | "WINERY"

export class BuildingType {

    // todo: create missing icons
    public static readonly FARM = new BuildingType("FARM", "Farm", "/icons/buildings/farm.png");
    public static readonly FISHERS_HUT = new BuildingType("FISHERS_HUT", "Fishers Hut", "/icons/buildings/farm.png");
    public static readonly MINE = new BuildingType("MINE", "Mine", "/icons/buildings/farm.png");
    public static readonly QUARRY = new BuildingType("QUARRY", "Quarry", "/icons/buildings/farm.png");
    public static readonly WOODCUTTER = new BuildingType("WOODCUTTER", "Woodcutter", "/icons/buildings/woodcutter.png");
    public static readonly CATTLE_FARM = new BuildingType("CATTLE_FARM", "Cattle Farm", "/icons/buildings/farm.png");
    public static readonly ARMOR_SMITH = new BuildingType("ARMOR_SMITH", "Armor Smith", "/icons/buildings/farm.png");
    public static readonly COOPER = new BuildingType("COOPER", "Cooper", "/icons/buildings/farm.png");
    public static readonly JEWELLER = new BuildingType("JEWELLER", "Jeweller", "/icons/buildings/farm.png");
    public static readonly SHEEP_FARM = new BuildingType("SHEEP_FARM", "Sheep Farm", "/icons/buildings/farm.png");
    public static readonly STABLES = new BuildingType("STABLES", "Stables", "/icons/buildings/farm.png");
    public static readonly TOOLMAKER = new BuildingType("TOOLMAKER", "Toolmaker", "/icons/buildings/farm.png");
    public static readonly WEAPON_SMITH = new BuildingType("WEAPON_SMITH", "Weapon Smith", "/icons/buildings/farm.png");
    public static readonly MARKET = new BuildingType("MARKET", "Market", "/icons/buildings/farm.png");
    public static readonly PARCHMENTERS_WORKSHOP = new BuildingType("PARCHMENTERS_WORKSHOP", "Parchmenters Workshop", "/icons/buildings/farm.png");
    public static readonly TAILORS_WORKSHOP = new BuildingType("TAILORS_WORKSHOP", "Tailors Workshop", "/icons/buildings/farm.png");
    public static readonly WINERY = new BuildingType("WINERY", "Winery", "/icons/buildings/farm.png");

    private static readonly values = [
        BuildingType.FARM,
        BuildingType.FISHERS_HUT,
        BuildingType.MINE,
        BuildingType.QUARRY,
        BuildingType.WOODCUTTER,
        BuildingType.CATTLE_FARM,
        BuildingType.ARMOR_SMITH,
        BuildingType.COOPER,
        BuildingType.JEWELLER,
        BuildingType.SHEEP_FARM,
        BuildingType.STABLES,
        BuildingType.TOOLMAKER,
        BuildingType.WEAPON_SMITH,
        BuildingType.MARKET,
        BuildingType.PARCHMENTERS_WORKSHOP,
        BuildingType.TAILORS_WORKSHOP,
        BuildingType.WINERY,
    ];

    public static getValues(): BuildingType[] {
        return BuildingType.values;
    }

    public static fromString(value: BuildingTypeString): BuildingType {
        switch (value) {
            case "FARM":
                return BuildingType.FARM;
            case "FISHERS_HUT":
                return BuildingType.FISHERS_HUT;
            case "MINE":
                return BuildingType.MINE;
            case "QUARRY":
                return BuildingType.QUARRY;
            case "WOODCUTTER":
                return BuildingType.WOODCUTTER;
            case "CATTLE_FARM":
                return BuildingType.CATTLE_FARM;
            case "ARMOR_SMITH":
                return BuildingType.ARMOR_SMITH;
            case "COOPER":
                return BuildingType.COOPER;
            case "JEWELLER":
                return BuildingType.JEWELLER;
            case "SHEEP_FARM":
                return BuildingType.SHEEP_FARM;
            case "STABLES":
                return BuildingType.STABLES;
            case "TOOLMAKER":
                return BuildingType.TOOLMAKER;
            case "WEAPON_SMITH":
                return BuildingType.WEAPON_SMITH;
            case "MARKET":
                return BuildingType.MARKET;
            case "PARCHMENTERS_WORKSHOP":
                return BuildingType.PARCHMENTERS_WORKSHOP;
            case "TAILORS_WORKSHOP":
                return BuildingType.TAILORS_WORKSHOP;
            case "WINERY":
                return BuildingType.WINERY;
        }
    }

    readonly id: string;
    readonly displayString: string;
    readonly icon: string;

    constructor(id: string, displayString: string, icon: string) {
        this.id = id;
        this.displayString = displayString;
        this.icon = icon;
    }
}