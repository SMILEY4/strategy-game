import {MapMode} from "../../../models/misc/mapMode";
import {Db} from "../../database";

export const MapService = {

    selectMapMode(mapMode: MapMode) {
        Db.gameSession.update(() => ({
            mapMode: mapMode,
        }));
    },

};