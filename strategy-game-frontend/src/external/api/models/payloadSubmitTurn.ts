import {BuildingType} from "../../../core/models/buildingType";
import {
    Command,
    CommandCreateCity,
    CommandPlaceMarker,
    CommandPlaceScout,
    CommandProductionQueueAddEntry,
} from "../../../core/models/command";
import {when, whenCase} from "../../../shared/when";

export interface PayloadSubmitTurn {
    commands: SubmitCommand[];
}

export interface SubmitCommand {
    type: "place-marker" | "place-scout" | "create-city" | "production-queue-add-entry";
}

export interface SubmitCommandPlaceMarker extends SubmitCommand {
    type: "place-marker"
    q: number,
    r: number,
}

export interface SubmitCommandPlaceScout extends SubmitCommand {
    type: "place-scout"
    q: number,
    r: number,
}

export interface SubmitCommandCreateCity extends SubmitCommand {
    type: "create-city"
    name: string,
    q: number,
    r: number,
    withNewProvince: boolean
}

export interface SubmitCommandProductionQueueAddEntry extends SubmitCommand {
    type: "production-queue-add-entry"
    cityId: string,
    buildingType: BuildingType
}


export namespace PayloadSubmitTurn {

    export function buildSubmitTurnPayload(commands: Command[]): PayloadSubmitTurn {
        return {
            commands: commands.map(cmd => buildSubmitCommand(cmd)),
        };
    }

    function buildSubmitCommand(cmd: Command): SubmitCommand {
        return when<string, SubmitCommand>(cmd.commandType,
            whenCase<string, SubmitCommandPlaceMarker>("place-marker", () => {
                const cmdPlaceMarker = cmd as CommandPlaceMarker;
                return {
                    type: "place-marker",
                    q: cmdPlaceMarker.q,
                    r: cmdPlaceMarker.r,
                };
            }),
            whenCase<string, SubmitCommandPlaceScout>("place-scout", () => {
                const cmdPlaceScout = cmd as CommandPlaceScout;
                return {
                    type: "place-scout",
                    q: cmdPlaceScout.q,
                    r: cmdPlaceScout.r,
                };
            }),
            whenCase<string, SubmitCommandCreateCity>("create-city", () => {
                const cmdCreateCity = cmd as CommandCreateCity;
                return {
                    type: "create-city",
                    name: cmdCreateCity.name,
                    q: cmdCreateCity.q,
                    r: cmdCreateCity.r,
                    withNewProvince: cmdCreateCity.withNewProvince,
                };
            }),
            whenCase<string, SubmitCommandProductionQueueAddEntry>("production-queue-add-entry", () => {
                const cmdCreateBuilding = cmd as CommandProductionQueueAddEntry;
                return {
                    type: "production-queue-add-entry",
                    cityId: cmdCreateBuilding.cityId,
                    buildingType: cmdCreateBuilding.buildingType,
                };
            }),
        );
    }
}