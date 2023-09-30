import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {CameraData} from "../../../models/cameraData";


export namespace CameraStore {


    interface StateValues {
        camera: CameraData;
    }


    interface StateActions {
        set: (camera: CameraData) => void;
    }


    const initialStateValues: StateValues = {
        camera: {
            x: 0,
            y: 0,
            zoom: 1
        },
    };


    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (camera: CameraData) => set(() => ({
                camera: camera,
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
