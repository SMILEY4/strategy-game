import type {CameraController} from "@app/features/game/gameplay/camera/camera-controller.ts";
import type {HexPosition} from "@app/features/game/models/hex-position.ts";

export interface GameActionJoinedGame {
    execute: (initialLocation: HexPosition) => void;
}

interface Dependencies {
    cameraController: CameraController
}

export const gameActionJoinedGame = ({cameraController}: Dependencies): GameActionJoinedGame => ({
    execute: (initialLocation) => {
        cameraController.lookAt(initialLocation);
    },
});
