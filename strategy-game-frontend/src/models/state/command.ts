export interface Command {
    commandType: "place-marker" | "create-city";
    cost: {
        money: number
    }
}

export interface CommandPlaceMarker extends Command {
    commandType: "place-marker"
    q: number,
    r: number,
}

export interface CommandCreateCity extends Command {
    commandType: "create-city"
    name: string,
    provinceId: string | null,
    q: number,
    r: number,
}