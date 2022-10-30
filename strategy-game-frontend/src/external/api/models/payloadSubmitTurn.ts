import {BuildingType} from "../../../core/models/buildingType";
import {Command, CommandCreateBuilding, CommandCreateCity, CommandPlaceMarker, CommandPlaceScout} from "../../../core/models/command";
import {when, whenCase} from "../../../shared/when";

export interface PayloadSubmitTurn {
    commands: SubmitCommand[];
}

export interface SubmitCommand {
    type: "place-marker" | "place-scout" | "create-city" | "create-building";
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
    parentCity: string | null
}

export interface SubmitCommandCreateBuilding extends SubmitCommand {
    type: "create-building"
    cityId: string,
    buildingType: BuildingType
}


export namespace PayloadSubmitTurn {

    export function buildSubmitTurnPayload(commands: Command[]): PayloadSubmitTurn {
        return {
            commands: commands.map(cmd => buildSubmitCommand(cmd))
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
                    parentCity: cmdCreateCity.parentCity
                };
            }),
            whenCase<string, SubmitCommandCreateBuilding>("create-building", () => {
                const cmdCreateBuilding = cmd as CommandCreateBuilding;
                return {
                    type: "create-building",
                    cityId: cmdCreateBuilding.cityId,
                    buildingType: cmdCreateBuilding.buildingType
                };
            })
        );
    }
}