import {LocalMonitoringStore} from "../local/LocalMonitoringStore";
import {WebGLMonitor} from "../../shared/webgl/monitor/webGLMonitor";

export class MonitoringRepository {

    public setWebGLMonitorData(data: WebGLMonitor.Data) {
        LocalMonitoringStore.useState.getState().setWebGLMonitorData(data);
    }

}

export namespace MonitoringRepository {

    export function useWebGLMonitorData(): WebGLMonitor.Data {
        return LocalMonitoringStore.useState(state => state.webGLMonitorData);
    }

}