import jwt_decode from "jwt-decode";
import create, {SetState} from "zustand";

export namespace UserStore {

    interface StateValues {
        idToken: string | null,
    }


    const initialStateValues: StateValues = {
        idToken: null
    };


    interface StateActions {
        setAuth: (token: string) => void;
        clearAuth: () => void;
    }


    function stateActions(set: SetState<State>): StateActions {
        return {
            setAuth: (idToken: string) => set(() => ({
                idToken: idToken,
            })),
            clearAuth: () => set(() => ({
                idToken: null,
            })),
        };
    }


    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>((set: SetState<State>) => ({
        ...initialStateValues,
        ...stateActions(set)
    }));

    export function userIdFromToken(token: string): string {
        if (token) {
            return (jwt_decode(token) as any).sub;
        } else {
            return "";
        }
    }

}
