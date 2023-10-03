import {WorldStore} from "../../_old_external/state/world/worldStore";
import {orNull} from "../../shared/utils";
import {Province} from "../models/province";
import {TilePosition} from "../models/tilePosition";

export function useProvinceAt(pos: TilePosition | null): Province | null {
    const tile = WorldStore.useState(state => state.tiles.find(t => t.position.q === pos?.q && t.position.r == pos?.r));
    const provinceId = tile ? tile.dataTier1?.owner?.provinceId : null;
    const province = WorldStore.useState(state => state.provinces.find(p => p.provinceId === provinceId));
    return orNull(province);
}