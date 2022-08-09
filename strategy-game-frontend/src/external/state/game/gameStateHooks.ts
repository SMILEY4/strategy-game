import {Country} from "../../../models/state/country";
import {GameStore} from "./gameStore";

export namespace GameStateHooks {

    export function useCountry(userId: string | null): Country | undefined {
        return GameStore.useState(state => state.countries.find(country => country.userId === userId));
    }

}