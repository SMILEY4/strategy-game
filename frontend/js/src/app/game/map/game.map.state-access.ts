import {MapMode} from "../../../models/misc/mapMode";
import {usePartialSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {Db} from "../../database";

export const MapStateAccess = {

    useMapMode(): MapMode {
        return usePartialSingletonEntity(Db.gameSession, e => e.mapMode);
    },

    getMapMode(): MapMode {
        return Db.gameSession.get().mapMode;
    },

};