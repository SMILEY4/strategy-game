import {UserStore} from "./userStore";

export namespace UserStateHooks {

    export function useIsAuthenticated(): boolean {
        return !!UserStore.useState(state => state.idToken);
    }

}