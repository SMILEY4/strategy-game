import React from "react";
import {DevWindow} from "./DevWindow";
import {useFullscreen} from "../../../../components/headless/useFullscreen";
import {CameraData} from "../../../../../models/misc/cameraData";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {CameraStateAccess} from "../../../../../app/game/camera/camera.state-access";
import {GameService} from "../../../../../app/game/game.service";

export namespace UseDevWindow {

    export function open() {
        const windowId = UID.generate();
        openWindow({
            id: windowId,
            groupId: WindowGroup.LEFT_SIDEBAR,
            anchor: WindowStore.ANCHOR_LEFT_SIDE,
            content: <DevWindow windowId={windowId}/>,
        });
    }

    export interface Data {
        fullscreen: {
            enter: () => void,
            exit: () => void
        },
        webgl: {
            loose: () => void,
            restore: () => void
        },
        camera: CameraData,
    }

    export function useData(): UseDevWindow.Data {
        const camera = CameraStateAccess.useCamera();
        const [enterFullscreen, exitFullscreen] = useFullscreen("root");
        return {
            fullscreen: {
                enter: enterFullscreen,
                exit: exitFullscreen,
            },
            webgl: {
                loose: () => GameService.looseWebGlContext(),
                restore: () => GameService.restoreWebGlContext(),
            },
            camera: camera,
        };
    }


}