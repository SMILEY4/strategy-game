import {Marker} from "../../models/Marker";
import {Tile} from "../../models/Tile";

export interface WorldStateAccess {
    getTile: (q: number, r: number) => Tile | null;
    getTiles: () => Tile[];
    setTiles: (tiles: Tile[]) => void;
    getMarkers: () => Marker[]
    setMarkers: (markers: Marker[]) => void
}