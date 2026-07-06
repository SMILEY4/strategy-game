import type {CameraDatabase} from "@app/features/game/database/camera.database.ts";
import type {CameraController} from "@app/features/game/gameplay/camera/camera-controller.ts";

interface Dependencies {
    cameraDb: CameraDatabase
}

export const cameraControllerFreecam = ({cameraDb}: Dependencies): CameraController => ({
    // todo ...
})