import {BuildingType} from "./buildingType";
import {TileIdentifier} from "./tile";

export interface Building {
    type: BuildingType,
    active: boolean,
    tile: TileIdentifier | null,
}