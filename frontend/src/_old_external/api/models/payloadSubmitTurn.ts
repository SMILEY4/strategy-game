import {BuildingType} from "../../../_old_core/models/buildingType";
import {
    Command,
    CommandCreateCity,
    CommandPlaceMarker,
    CommandPlaceScout,
    CommandProductionQueueAddBuildingEntry,
    CommandProductionQueueAddSettlerEntry, CommandUpgradeSettlementTier,
} from "../../../_old_core/models/command";
import {when, whenCase} from "../../../shared/when";

export interface PayloadSubmitTurn {
    commands: SubmitCommand[];
}

export interface SubmitCommand {
    type: "place-marker"
        | "place-scout"
        | "create-city"
        | "production-queue-add-entry.building"
        | "production-queue-add-entry.settler"
        | "upgrade-settlement-tier";
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

export interface SubmitCommandUpgradeSettlementTier extends SubmitCommand {
    type: "upgrade-settlement-tier";
    cityId: string;
}

export interface SubmitCommandProductionQueueAddBuildingEntry extends SubmitCommand {
    type: "production-queue-add-entry.building"
    cityId: string,
    buildingType: BuildingType
}

export interface SubmitCommandProductionQueueAddSettlerEntry extends SubmitCommand {
    type: "production-queue-add-entry.settler"
    cityId: string,
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
            whenCase<string, SubmitCommandUpgradeSettlementTier>("upgrade-settlement-tier", () => {
                const cmdUpgradeTier = cmd as CommandUpgradeSettlementTier;
                return {
                    type: "upgrade-settlement-tier",
                    cityId: cmdUpgradeTier.cityId
                };
            }),
            whenCase<string, SubmitCommandProductionQueueAddBuildingEntry>("production-queue-add-entry.building", () => {
                const cmdCreateBuilding = cmd as CommandProductionQueueAddBuildingEntry;
                return {
                    type: "production-queue-add-entry.building",
                    cityId: cmdCreateBuilding.cityId,
                    buildingType: cmdCreateBuilding.buildingType,
                };
            }),
            whenCase<string, SubmitCommandProductionQueueAddSettlerEntry>("production-queue-add-entry.settler", () => {
                const cmdCreateBuilding = cmd as CommandProductionQueueAddSettlerEntry;
                return {
                    type: "production-queue-add-entry.settler",
                    cityId: cmdCreateBuilding.cityId,
                };
            }),
        );
    }
}