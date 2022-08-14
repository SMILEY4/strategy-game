import {UserStore} from "./userStore";

export namespace UserStateHooks {

    export function useIsAuthenticated(): boolean {
        return !!UserStore.useState(state => state.idToken);
    }

    export function useUserId(): string | null {
        const token = UserStore.useState(state => state.idToken);
        if (token) {
            return UserStore.userIdFromToken(token);
        } else {
            return null;
        }
    }


}