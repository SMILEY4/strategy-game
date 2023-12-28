import {LocalMonitoringStore} from "./LocalMonitoringStore";
import {WebGLMonitor} from "../shared/webgl/monitor/webGLMonitor";

export class MonitoringRepository {

    public setWebGLMonitorData(data: WebGLMonitor.Data) {
        LocalMonitoringStore.useState.getState().setWebGLMonitorData(data);
    }

    public setNextTurnDurations(values: number[]) {
        LocalMonitoringStore.useState.getState().setNextTurnDurations(values);
    }

}

export namespace MonitoringRepository {

    export function useWebGLMonitorData(): WebGLMonitor.Data {
        return LocalMonitoringStore.useState(state => state.webGLMonitorData);
    }

    export function useNextTurnDurations(): number[] {
        return LocalMonitoringStore.useState(state => state.nextTurnDurations);
    }

}