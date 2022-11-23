import {WorldStore} from "../../external/state/world/worldStore";
import {orNull} from "../../shared/utils";
import {Province} from "../models/province";

export function useProvinceByCity(cityId: string | null | undefined): Province | null {
    return orNull(WorldStore.useState(state => state.provinces.find(p => cityId && p.cityIds.indexOf(cityId) != -1)));
}