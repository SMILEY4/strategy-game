import {WorldStore} from "../../external/state/world/worldStore";
import {orNull} from "../../shared/utils";
import {Province} from "../models/province";
import {TilePosition} from "../models/tilePosition";

export function useProvinceById(provinceId: string | null | undefined): Province | null {
    return orNull(WorldStore.useState(state => state.provinces.find(p => p.provinceId === provinceId)));
}