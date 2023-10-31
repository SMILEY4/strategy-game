import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {DevWindow} from "./DevWindow";
import {CameraRepository} from "../../../../../state/access/CameraRepository";
import {useFullscreen} from "../../../../components/headless/useFullscreen";
import {AppCtx} from "../../../../../appContext";
import {CameraData} from "../../../../../models/cameraData";

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
        camera: CameraData,
        fullscreen: {
            enter: () => void,
            exit: () => void
        },
        webgl: {
            loose: () => void,
            restore: () => void
        }
    }

    export function useData(): UseDevWindow.Data {
        const camera = CameraRepository.useCamera();
        const [enterFullscreen, exitFullscreen] = useFullscreen("root");
        const [looseWGLContext, restoreWGLContext] = useWebGlContext();
        return {
            camera: camera,
            fullscreen: {
                enter: enterFullscreen,
                exit: exitFullscreen,
            },
            webgl: {
                loose: looseWGLContext,
                restore: restoreWGLContext,
            },
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