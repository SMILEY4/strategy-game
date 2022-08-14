import {City} from "../../../models/state/city";
import {Country} from "../../../models/state/country";
import {Tile} from "../../../models/state/tile";
import {UserStateHooks} from "../user/userStateHooks";
import {GameStore} from "./gameStore";

export namespace GameStateHooks {

    export function useCountry(userId: string | null): Country | undefined {
        return GameStore.useState(state => state.countries.find(country => country.userId === userId));
    }

    export function usePlayerCountry(): Country | undefined {
        return GameStateHooks.useCountry(UserStateHooks.useUserId());
    }

    export function useTileAt(q: number, r: number): Tile | undefined {
        return GameStore.useState(state => state.tiles.find(t => t.position.q === q && t.position.r === r))
    }

    export function useCityAt(q: number, r: number): City | undefined {
        return GameStore.useState(state => state.cities.find(c => c.tile.position.q === q && c.tile.position.r === r))
    }

}