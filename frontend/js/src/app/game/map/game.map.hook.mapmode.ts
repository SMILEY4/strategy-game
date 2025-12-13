import {MapMode} from "../../../models/misc/mapMode";
import {usePartialSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";

export function useMapMode(): MapMode {
    return usePartialSingletonEntity(App.gameSessionDatabase, e => e.mapMode);
}