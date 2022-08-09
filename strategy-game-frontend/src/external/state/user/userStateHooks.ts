import jwt_decode from "jwt-decode";
import {UserStore} from "./userStore";

export namespace UserStateHooks {

    export function useIsAuthenticated(): boolean {
        return !!UserStore.useState(state => state.idToken);
    }

    export function useUserId(): string | null {
        const token = UserStore.useState(state => state.idToken);
        if (token) {
            return extractUserId(token);
        } else {
            return null;
        }
    }

    function extractUserId(token: string): string {
        if (token) {
            return (jwt_decode(token) as any).sub;
        } else {
            return "";
        }
    }


}