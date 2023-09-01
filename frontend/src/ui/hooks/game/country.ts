import {CountriesStore} from "../../../logic/game/store/countriesStore";
import {Country} from "../../../models/country";

export function usePlayerCountry(): Country {
    const playerId = "smiley_4_" // temp
    const country = CountriesStore.useState(state => state.countries.find(c => c.playerName === playerId));
    if (country) {
        return country;
    } else {
        return Country.UNDEFINED;
    }
}

export function useCountry(countryId: string): Country {
    const country = CountriesStore.useState(state => state.countries.find(c => c.identifier.id === countryId));
    if (country) {
        return country;
    } else {
        return Country.UNDEFINED;
    }
}