import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {WebGLMonitor} from "../../../../../shared/webgl/monitor/webGLMonitor";
import {DevStatsWindow} from "./DevStatsWindow";
import {MonitoringRepository} from "../../../../../state/database/monitoringRepository";

export namespace UseDevStatsWindow {

    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const addWindow = useOpenWindow();
        return () => {
            addWindow({
                id: WINDOW_ID,
                className: "dev-stats-window",
                left: 25,
                top: 60,
                bottom: 25,
                width: 450,
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