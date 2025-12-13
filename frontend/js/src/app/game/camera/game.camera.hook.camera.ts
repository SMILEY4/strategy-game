import {CameraData} from "../../../models/misc/cameraData";
import {useSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";

export function useCamera(): CameraData {
    return useSingletonEntity(App.cameraDatabase);
}