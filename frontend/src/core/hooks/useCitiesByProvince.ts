import {WorldStore} from "../../external/state/world/worldStore";
import {City} from "../models/city";
import {useProvinceById} from "./useProvinceById";

export function useCitiesByProvince(provinceId: string | null | undefined): City[] {
    const province = useProvinceById(provinceId);
    const cityIds = province ? province.cityIds : [];
    return WorldStore.useState(state => state.cities.filter(c => cityIds.indexOf(c.cityId) !== -1));
}
