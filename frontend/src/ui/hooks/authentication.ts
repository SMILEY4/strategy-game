import {useGotoLoginRedirect} from "./navigate";
import {AppCtx} from "../../logic/appContext";

export function useAuthenticated() {
    const userService = AppCtx.di.get(AppCtx.DIQ.UserService)
    return userService.isAuthenticated();
}

export function useHandleUnauthorized() {
    const redirect = useGotoLoginRedirect("/login");
    return () => {
        redirect();
    };
}