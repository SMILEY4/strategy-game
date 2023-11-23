import {SetState} from "../../shared/zustandUtils";
import create from "zustand";
import {WebGLMonitor} from "../../shared/webgl/monitor/webGLMonitor";

export namespace LocalMonitoringStore {

    interface StateValues {
        webGLMonitorData: WebGLMonitor.Data;
    }

    const initialStateValues: StateValues = {
        webGLMonitorData: {
            ...WebGLMonitor.EMPTY_DATA,
        },
    };

    interface StateActions {
        setWebGLMonitorData: (webGLMonitorData: WebGLMonitor.Data) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setWebGLMonitorData: (webGLMonitorData: WebGLMonitor.Data) => set(() => ({
                webGLMonitorData: webGLMonitorData,
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
