import {MapMode} from "../../models/mapMode";
import {LocalGameStore} from "../local/LocalGameStore";

export class MapModeRepository {

    public getMapMode(): MapMode {
        return LocalGameStore.useState.getState().mapMode;
    }

}


export namespace MapModeRepository {

    export function useMapMode(): [MapMode, (mode: MapMode) => void] {
        return [
            LocalGameStore.useState(state => state.mapMode),
            LocalGameStore.useState(state => state.setMapMode),
        ];
    }

}