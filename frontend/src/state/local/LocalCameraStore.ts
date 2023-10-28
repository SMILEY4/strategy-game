import {SetState} from "../../shared/zustandUtils";
import create from "zustand";
import {CameraData} from "../../models/cameraData";

export namespace LocalCameraStore {

    interface StateValues extends CameraData {
    }

    const initialStateValues: StateValues = {
        x: 0,
        y: 0,
        zoom: 1,
    };

    interface StateActions {
        set: (camera: CameraData) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (camera: CameraData) => set(() => camera),
        };
    }


    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set),
    }));

}
