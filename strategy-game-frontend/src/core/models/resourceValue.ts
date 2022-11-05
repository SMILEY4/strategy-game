export interface ResourceValue {
    type: "money" | "wood" | "stone" | "metal" | "food",
    value: number,
    change: number
}