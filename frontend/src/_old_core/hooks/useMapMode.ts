import {GameStore} from "../../_old_external/state/game/gameStore";
import {MapMode} from "../models/mapMode";

export function useMapMode(): [MapMode, (mode: MapMode) => void] {
    const currentMode = GameStore.useState(state => state.mapMode);
    const setState = GameStore.useState().setMapMode;
    return [currentMode, setState];
}