import {useGotoLoginRedirect} from "./navigate";
import {AppCtx} from "../../appContext";

export function useAuthenticated() {
    const userService = AppCtx.UserService()
    return userService.isAuthenticated();
}

export function useHandleUnauthorized() {
    const redirect = useGotoLoginRedirect("/login");
    return () => {
        redirect();
    };
}