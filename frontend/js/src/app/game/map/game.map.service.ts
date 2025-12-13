import {MapMode} from "../../../models/misc/mapMode";
import {App} from "../../../appContext";

export const GameMapService = {

    selectMapMode(mapMode: MapMode) {
        App.gameStateWriter.setSelectedMapMode(mapMode);
    },

};