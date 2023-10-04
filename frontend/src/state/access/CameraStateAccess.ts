import {CameraData} from "../local/camera/cameraData";
import {LocalCameraStore} from "../local/camera/LocalCameraStore";

export namespace CameraStateAccess {

    export function getCamera(): CameraData {
        return LocalCameraStore.useState.getState();
    }

    export function setCamera(camera: CameraData) {
        LocalCameraStore.useState.getState().set(camera);
    }

}