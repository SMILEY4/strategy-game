import React from "react";
import {WebGLMonitor} from "../../../../../common/webgl/monitor/webGLMonitor";
import {DevStatsWindow} from "./DevStatsWindow";
import {MonitoringRepository} from "../../../../../state/repository/monitoringRepository";
import {useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";

export namespace UseDevStatsWindow {

    export function useOpen() {
        const open = useOpenWindow();
        return () => {
            const windowId = UID.generate();
            open({
                id: windowId,
                groupId: WindowGroup.LEFT_SIDEBAR,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
                content: <DevStatsWindow windowId={windowId}/>,
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