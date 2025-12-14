import {CameraData} from "../../../models/misc/cameraData";
import {useSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {Db} from "../../database";

export const CameraStateAccess = {

    useCamera(): CameraData {
        return useSingletonEntity(Db.camera);
    },

    get(): CameraData {
        return Db.camera.get();
    },

};