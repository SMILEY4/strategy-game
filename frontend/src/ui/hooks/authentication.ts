import {useGotoLoginRedirect} from "./navigate";
import {useDI} from "../../appContext";
import {UserService} from "../../logic/user/userService";

export function useAuthenticated() {
    const userService = useDI<UserService>(UserService.name)
    return userService.isAuthenticated();
}

export function useHandleUnauthorized() {
    const redirect = useGotoLoginRedirect("/login");
    return () => {
        redirect();
    };
}