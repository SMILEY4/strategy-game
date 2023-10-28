import {CameraData} from "../../models/cameraData";
import {LocalCameraStore} from "../local/LocalCameraStore";

export class CameraRepository {

    public getCamera(): CameraData {
        return LocalCameraStore.useState.getState();
    }

    public setCamera(camera: CameraData) {
        LocalCameraStore.useState.getState().set(camera);
    }

}

export namespace CameraRepository {

    export function useCamera(): CameraData {
        return LocalCameraStore.useState(state => state);
    }

}