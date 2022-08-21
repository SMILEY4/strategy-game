import {City} from "../../../models/state/city";
import {Country} from "../../../models/state/country";
import {Marker} from "../../../models/state/marker";
import {Province} from "../../../models/state/Province";
import {Tile} from "../../../models/state/tile";
import {UserStore} from "../user/userStore";
import {GameStore} from "./gameStore";

export class GameStateAccess {

    getStateRevision(): string {
        return GameStore.useState.getState().revisionId
    }

    setCurrentTurn(turn: number): void {
        GameStore.useState.getState().setCurrentTurn(turn);
    }

    getPlayerCountry(): Country {
        const userId = UserStore.userIdFromToken(UserStore.useState.getState().idToken!!);
        const country = this.getCountries().find(country => country.userId === userId);
        if (!country) {
            throw Error("No country found for current user");
        }
        return country;
    }

    getCountries(): Country[] {
        return GameStore.useState.getState().countries;
    }

    setCountries(countries: Country[]): void {
        GameStore.useState.getState().setCountries(countries);
    }

    setProvinces(provinces: Province[]): void {
        GameStore.useState.getState().setProvinces(provinces);
    }

    getTileAt(q: number, r: number): Tile | null {
        const tile = GameStore.useState.getState().tiles.find(t => t.position.q === q && t.position.r === r);
        return tile ? tile : null;
    }

    getTiles(): Tile[] {
        return GameStore.useState.getState().tiles;
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