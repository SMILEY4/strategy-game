import React from "react";
import {DevWindow} from "./DevWindow";
import {useFullscreen} from "../../../../components/headless/useFullscreen";
import {CameraData} from "../../../../../models/base/cameraData";
import {UseDevStatsWindow} from "../devstats/useDevStatsWindow";
import {useDI} from "../../../../../appContext";
import {GameLoopService} from "../../../../../logic/game/gameLoopService";
import {CameraRepository} from "../../../../../state/repository/cameraRepository";
import {useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";

export namespace UseDevWindow {

    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const open = useOpenWindow();
        return () => {
            open({
                id: WINDOW_ID,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
                content: <DevWindow windowId={WINDOW_ID}/>,
            });
        };
    }

    export interface Data {
        open: {
            devStats: () => void
        }
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
        const openDevStats = UseDevStatsWindow.useOpen();
        const camera = CameraRepository.useCamera();
        const [enterFullscreen, exitFullscreen] = useFullscreen("root");
        const [looseWGLContext, restoreWGLContext] = useWebGlContext();
        return {
            open: {
                devStats: openDevStats,
            },
            fullscreen: {
                enter: enterFullscreen,
                exit: exitFullscreen,
            },
            webgl: {
                loose: looseWGLContext,
                restore: restoreWGLContext,
            },
            camera: camera,
        };
    }


    function useWebGlContext() {
        const service = useDI<GameLoopService>(GameLoopService.name);
        return [
            () => service.getCanvasHandle().debugLooseWebglContext(),
            () => service.getCanvasHandle().debugRestoreWebglContext(),
        ];
    }

}