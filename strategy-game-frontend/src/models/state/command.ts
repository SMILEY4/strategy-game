export interface Command {
    commandType: "place-marker" | "create-city";
}

export interface CommandPlaceMarker extends Command {
    commandType: "place-marker"
    q: number,
    r: number,
}

export interface CommandCreateCity extends Command {
    commandType: "create-city"
    q: number,
    r: number,
}