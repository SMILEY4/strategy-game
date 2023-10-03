import {WorldStore} from "../../_old_external/state/world/worldStore";
import {Province} from "../models/province";

export function useCountryProvinces(countryId: string | null | undefined): Province[] {
    return WorldStore.useState(state => state.provinces.filter(p => p.countryId === countryId))
}
