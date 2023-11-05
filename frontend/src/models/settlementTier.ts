export type SettlementTierString = "VILLAGE" | "TOWN" | "CITY"

export class SettlementTier {

    public static readonly CITY = new SettlementTier({
        displayString: "City",
        level: 2,
        buildingSlots: 6,
        minRequiredSize: 6,
        maxSize: 9999,
        nextTier: null,
    });

    public static readonly TOWN = new SettlementTier({
        displayString: "Town",
        level: 1,
        buildingSlots: 4,
        minRequiredSize: 2,
        maxSize: 8,
        nextTier: SettlementTier.CITY,
    });

    public static readonly VILLAGE = new SettlementTier({
        displayString: "Village",
        level: 0,
        buildingSlots: 2,
        minRequiredSize: 0,
        maxSize: 2,
        nextTier: SettlementTier.TOWN,
    });


    private static readonly values = [SettlementTier.VILLAGE, SettlementTier.TOWN, SettlementTier.CITY];

    public static getValues(): SettlementTier[] {
        return SettlementTier.values;
    }

    public static fromString(value: SettlementTierString): SettlementTier {
        switch (value) {
            case "VILLAGE":
                return SettlementTier.VILLAGE;
            case "TOWN":
                return SettlementTier.TOWN;
            case "CITY":
                return SettlementTier.CITY;
        }
    }

    readonly displayString: string;
    readonly level: number;
    readonly buildingSlots: number;
    readonly minRequiredSize: number;
    readonly maxSize: number;
    readonly nextTier: SettlementTier | null;

    private constructor(data: {
        displayString: string,
        level: number,
        buildingSlots: number,
        minRequiredSize: number,
        maxSize: number,
        nextTier: SettlementTier | null
    }) {
        this.displayString = data.displayString;
        this.level = data.level;
        this.buildingSlots = data.buildingSlots;
        this.minRequiredSize = data.minRequiredSize;
        this.maxSize = data.maxSize;
        this.nextTier = data.nextTier;
    }
}