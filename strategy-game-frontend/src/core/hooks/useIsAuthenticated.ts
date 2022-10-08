import {UserStore} from "../../external/state/user/userStore";

export function useIsAuthenticated(): boolean {
    return !!UserStore.useState(state => state.idToken);
}