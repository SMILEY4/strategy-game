import {WorldStore} from "../../external/state/world/worldStore";
import {Country} from "../../models/state/country";
import {orNull} from "../../shared/utils";

export function useCountry(userId: string): Country | null {
    return orNull(WorldStore.useState(state => state.countries.find(country => country.userId === userId)));
}
