import {LocalCameraStore} from "../local/camera/LocalCameraStore";
import {CameraData} from "../../models/cameraData";

export namespace CameraStateAccess {

    export function getCamera(): CameraData {
        return LocalCameraStore.useState.getState();
    }

    export function setCamera(camera: CameraData) {
        LocalCameraStore.useState.getState().set(camera);
    }

    export function useCamera(): CameraData {
        return LocalCameraStore.useState(state => state)
    }

}