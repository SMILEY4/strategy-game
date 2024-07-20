import {WebGLMonitor} from "../../shared/webgl/monitor/webGLMonitor";
import {SetState} from "../../shared/zustandUtils";
import create from "zustand";

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

namespace LocalMonitoringStore {

    interface StateValues {
        webGLMonitorData: WebGLMonitor.Data;
        nextTurnDurations: number[]
    }

    const initialStateValues: StateValues = {
        webGLMonitorData: {
            ...WebGLMonitor.EMPTY_DATA,
        },
        nextTurnDurations: []
    };

    interface StateActions {
        setWebGLMonitorData: (webGLMonitorData: WebGLMonitor.Data) => void;
        setNextTurnDurations: (values: number[]) => void;

    }


    function stateActions(set: SetState<State>): StateActions {
        return {
            setWebGLMonitorData: (webGLMonitorData: WebGLMonitor.Data) => set(() => ({
                webGLMonitorData: {...webGLMonitorData},
            })),
            setNextTurnDurations: (values: number[]) => set(() => ({
                nextTurnDurations: [...values],
            })),
        };
    }


    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set),
    }));

}
