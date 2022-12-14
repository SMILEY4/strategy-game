import {WorldStore} from "../../external/state/world/worldStore";
import {Country} from "../models/country";

export function useCountryByUser(userId: string | null): Country | null {
    return WorldStore.useState(state => state.countries.byUserId(userId));
}
