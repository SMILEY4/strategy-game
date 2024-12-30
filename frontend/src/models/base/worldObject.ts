import {WorldObjectType} from "./worldObjectType";
import {TileIdentifier} from "./tile";
import {CountryIdentifier} from "./country";

export interface WorldObject {
    identifier: WorldObjectIdentifier,
    tile: TileIdentifier,
    country: CountryIdentifier,
    movementPoints: number,
}

export interface WorldObjectIdentifier {
    id: string;
    type: WorldObjectType,
}