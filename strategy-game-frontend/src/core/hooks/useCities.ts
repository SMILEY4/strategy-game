import {WorldStore} from "../../external/state/world/worldStore";

export function useCities() {
    return WorldStore.useState(state => state.cities)
}
