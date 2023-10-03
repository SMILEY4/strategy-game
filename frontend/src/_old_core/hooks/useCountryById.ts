import {WorldStore} from "../../_old_external/state/world/worldStore";
import {Country} from "../models/country";

export function useCountryById(countryId: string | null | undefined): Country | null {
    return WorldStore.useState(state => state.countries.byCountryId(countryId ? countryId : null));
}
