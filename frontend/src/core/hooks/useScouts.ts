import {WorldStore} from "../../external/state/world/worldStore";
import {Scout} from "../models/scout";

export function useScouts(): Scout[] {
    return WorldStore.useState(state => state.scouts);
}