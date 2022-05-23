import {Marker} from "../../models/marker";
import {Tile} from "../../models/tile";

export interface WorldStateAccess {
    getTile: (q: number, r: number) => Tile | null;
    getTiles: () => Tile[];
    setTiles: (tiles: Tile[]) => void;
    getMarkers: () => Marker[]
    setMarkers: (markers: Marker[]) => void
}