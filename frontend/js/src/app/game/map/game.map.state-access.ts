import {MapMode} from "../../../models/misc/mapMode";
import {usePartialSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";

export const MapStateAccess = {

    useMapMode(): MapMode {
        return usePartialSingletonEntity(App.gameSessionDatabase, e => e.mapMode);
    },

    getMapMode(): MapMode {
        return App.gameSessionDatabase.get().mapMode;
    },

};