import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {DevWindow} from "./DevWindow";
import {CameraRepository} from "../../../../../state/access/CameraRepository";
import {useFullscreen} from "../../../../components/headless/useFullscreen";
import {AppCtx} from "../../../../../appContext";
import {CameraData} from "../../../../../models/cameraData";
import {MonitoringRepository} from "../../../../../state/access/MonitoringRepository";
import {WebGLMonitor} from "../../../../../shared/webgl/monitor/webGLMonitor";
import {DevStatsWindow} from "../devstats/DevStatsWindow";
import {UseDevStatsWindow} from "../devstats/useDevStatsWindow";

export namespace UseDevWindow {

    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const addWindow = useOpenWindow();
        return () => {
            addWindow({
                id: WINDOW_ID,
                className: "dev-window",
                left: 25,
                top: 60,
                bottom: 25,
                width: 360,
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
        const openDevStats = UseDevStatsWindow.useOpen()
        const camera = CameraRepository.useCamera();
        const [enterFullscreen, exitFullscreen] = useFullscreen("root");
        const [looseWGLContext, restoreWGLContext] = useWebGlContext();
        return {
            open: {
                devStats: openDevStats
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
        const canvasHandle = AppCtx.CanvasHandle();
        return [
            () => canvasHandle.debugLooseWebglContext(),
            () => canvasHandle.debugRestoreWebglContext(),
        ];
    }

}