import {City} from "../../../models/state/city";
import {Country} from "../../../models/state/country";
import {Marker} from "../../../models/state/marker";
import {Province} from "../../../models/state/Province";
import {Tile} from "../../../models/state/tile";
import {UserStore} from "../user/userStore";
import {GameStore} from "./gameStore";

export class GameStateAccess {

    getStateRevision(): string {
        return GameStore.useState.getState().revisionId;
    }

    getState(): GameStore.StateValues {
        return GameStore.useState.getState();
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

    getTileAt(q: number, r: number): Tile | null {
        const tile = GameStore.useState.getState().tiles.find(t => t.position.q === q && t.position.r === r);
        return tile ? tile : null;
    }

    setState(
        currentTurn: number,
        tiles: Tile[],
        countries: Country[],
        provinces: Province[],
        cities: City[],
        markers: Marker[],
    ) {
        GameStore.useState.getState().setState(currentTurn, tiles, countries, provinces, cities, markers);
    }

}