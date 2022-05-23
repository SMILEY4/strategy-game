import {Marker} from "../../../ports/models/marker";
import {Tile} from "../../../ports/models/tile";
import {WorldStateAccess} from "../../../ports/required/state/worldStateAccess";
import {WorldStore} from "./worldStore";

export class WorldStateAccessImpl implements WorldStateAccess {

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