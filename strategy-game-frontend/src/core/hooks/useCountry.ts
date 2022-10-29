import {WorldStore} from "../../external/state/world/worldStore";
import {Country} from "../models/country";
import {orNull} from "../../shared/utils";

export function useCountry(userId: string | null): Country | null {
    return orNull(WorldStore.useState(state => state.countries.find(country => country.userId === userId)));
}
