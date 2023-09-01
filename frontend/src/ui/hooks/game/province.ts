import {ProvincesStore} from "../../../logic/game/store/provincesStore";
import {Province} from "../../../models/province";

export function useProvince(provinceId: string): Province {
    const province = ProvincesStore.useState(state => state.provinces.find(c => c.identifier.id === provinceId));
    if (province) {
        return province;
    } else {
        return Province.UNDEFINED;
    }
}