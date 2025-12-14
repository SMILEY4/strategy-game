import {MapMode} from "../../../models/misc/mapMode";
import {App} from "../../../appContext";
import {Db} from "../../database";

export const GameMapService = {

    selectMapMode(mapMode: MapMode) {
        Db.gameSession.update(() => ({
            mapMode: mapMode,
        }));
    },

};