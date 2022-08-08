import {City} from "../../../models/state/city";
import {Marker} from "../../../models/state/marker";
import {Tile} from "../../../models/state/tile";
import {GameStore} from "./gameStore";

export class GameStateAccess {

    setCurrentTurn(turn: number): void {
        GameStore.useState.getState().setCurrentTurn(turn)
    }

    getCurrentTurn(): number {
        return GameStore.useState.getState().currentTurn
    }


    getTileAt(q: number, r: number): Tile | null {
        const tile = GameStore.useState.getState().map.find(t => t.position.q === q && t.position.r === r);
        return tile ? tile : null;
    }

    getTiles(): Tile[] {
        return GameStore.useState.getState().map;
    }

    setTiles(tiles: Tile[]): void {
        GameStore.useState.getState().setTiles(tiles);
    }


    getMarkers(): Marker[] {
        return GameStore.useState.getState().markers;
    }

    setMarkers(markers: Marker[]): void {
        GameStore.useState.getState().setMarkers(markers);
    }


    getCities(): City[] {
        return GameStore.useState.getState().cities;
    }

    setCities(cities: City[]): void {
        GameStore.useState.getState().setCities(cities);
    }

}