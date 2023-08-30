import {AppConfig} from "../../main";
import {useGotoLoginRedirect} from "./navigate";

export function useAuthenticated() {
    const repository = AppConfig.di.get(AppConfig.DIQ.UserRepository);
    return repository.isAuth();
}

export function useHandleUnauthorized() {
    const redirect = useGotoLoginRedirect("/login");
    return () => {
        redirect();
    };
}