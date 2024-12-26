import React from "react";
import {WebGLMonitor} from "../../../../../common/webgl/monitor/webGLMonitor";
import {DevStatsWindow} from "./DevStatsWindow";
import {MonitoringRepository} from "../../../../../state/repository/monitoringRepository";
import {useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";

export namespace UseDevStatsWindow {

    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const open = useOpenWindow();
        return () => {
            open({
                id: WINDOW_ID,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
                content: <DevStatsWindow windowId={WINDOW_ID}/>,
            });
        };
    }

    export interface Data {
        rendering: {
            webGLMonitorData: WebGLMonitor.Data,
        },
        actions: {
            nextTurn: number[]
        }
    }

    export function useData(): UseDevStatsWindow.Data {
        const webGLMonitorData = MonitoringRepository.useWebGLMonitorData();
        const nextTurnDurations = MonitoringRepository.useNextTurnDurations();

        return {
            rendering: {
                webGLMonitorData: webGLMonitorData,
            },
            actions: {
                nextTurn: nextTurnDurations,
            },
        };
    }

}