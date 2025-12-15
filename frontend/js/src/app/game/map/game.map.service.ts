import {MapMode} from "../../../models/misc/mapMode";
import {Db} from "../../database";

export const GameMapService = {

    selectMapMode(mapMode: MapMode) {
        Db.gameSession.update(() => ({
            mapMode: mapMode,
        }));
    },

};