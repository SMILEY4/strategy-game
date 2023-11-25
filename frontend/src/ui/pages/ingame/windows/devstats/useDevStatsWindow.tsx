import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {MonitoringRepository} from "../../../../../state/access/MonitoringRepository";
import {WebGLMonitor} from "../../../../../shared/webgl/monitor/webGLMonitor";
import {DevStatsWindow} from "./DevStatsWindow";

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
                width: 360,
                content: <DevStatsWindow windowId={WINDOW_ID}/>,
            });
        };
    }

    export interface Data {
        rendering: {
            webGLMonitorData: WebGLMonitor.Data,
        }
    }

    export function useData(): UseDevStatsWindow.Data {
        const webGLMonitorData = MonitoringRepository.useWebGLMonitorData();
        return {
            rendering: {
                webGLMonitorData: webGLMonitorData,
            }
        };
    }

}