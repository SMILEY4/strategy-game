import {Marker} from "../../../models/marker";
import {Tile} from "../../../models/tile";
import {WorldStore} from "./worldStore";

export class WorldStateAccess {

    getTile(q: number, r: number): Tile | null {
        const tile = WorldStore.useState.getState().map.find(t => t.q === q && t.r === r);
        return tile ? tile : null;
    }

    getTiles(): Tile[] {
        return WorldStore.useState.getState().map;
    }

    setTiles(tiles: Tile[]): void {
        WorldStore.useState.getState().setTiles(tiles)
    }

    getMarkers(): Marker[] {
        return WorldStore.useState.getState().playerMarkers;
    }

    setMarkers(markers: Marker[]): void {
        WorldStore.useState.getState().setMarkers(markers);
    }

}