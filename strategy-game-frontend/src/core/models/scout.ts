import {TileRef} from "./tileRef";

export interface Scout {
    tile: TileRef;
    turn: number,
    countryId: string;
}