export interface Command {
    commandType: "place-marker"  | "place-scout" | "create-city";
    cost: {
        money: number
    }
}

export interface CommandPlaceMarker extends Command {
    commandType: "place-marker"
    q: number,
    r: number,
}

export interface CommandPlaceScout extends Command {
    commandType: "place-scout"
    q: number,
    r: number,
}

export interface CommandCreateCity extends Command {
    commandType: "create-city"
    name: string,
    q: number,
    r: number,
    parentCity: string | null
}