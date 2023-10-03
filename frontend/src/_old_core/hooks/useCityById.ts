import {WorldStore} from "../../_old_external/state/world/worldStore";
import {orNull} from "../../shared/utils";
import {City} from "../models/city";

export function useCityById(cityId: string | null | undefined): City | null {
    return orNull(WorldStore.useState(state => state.cities.find(c => c.cityId === cityId)));
}