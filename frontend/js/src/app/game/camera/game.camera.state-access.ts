import {CameraData} from "../../../models/misc/cameraData";
import {useSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";

export const CameraStateAccess = {

    useCamera(): CameraData {
        return useSingletonEntity(App.cameraDatabase);
    },

    get(): CameraData {
        return App.cameraDatabase.get();
    },

};