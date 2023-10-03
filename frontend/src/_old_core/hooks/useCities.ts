import {WorldStore} from "../../_old_external/state/world/worldStore";

export function useCities() {
    return WorldStore.useState(state => state.cities)
}
