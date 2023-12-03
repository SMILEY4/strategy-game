import {BuildingType} from "./buildingType";
import {TileIdentifier} from "./tile";
import {DetailLogEntry} from "./detailLogEntry";

export interface Building {
    type: BuildingType,
    active: boolean,
    tile: TileIdentifier | null,
    details: DetailLogEntry<BuildingDetailType>[]
}

export type  BuildingDetailType
    = "WORKED_TILE"
    | "ACTIVITY"
    | "CONSUMED"
    | "PRODUCED"
    | "MISSING"