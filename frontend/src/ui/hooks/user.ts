import {AppConfig} from "../../main";
import {useLocation, useNavigate} from "react-router-dom";
import {Base64} from "../../shared/base64";
import {useQuery} from "../components/misc/useQuery";
import {optional} from "../../shared/optional";

export function useLogin() {
    const action = AppConfig.di.get(AppConfig.DIQ.UserLoginAction);
    return (email: string, password: string) => action.perform(email, password)
}

export function useSignup() {
    const action = AppConfig.di.get(AppConfig.DIQ.UserSignUpAction);
    return (email: string, password: string, username: string) => action.perform(email, password, username)
}

export function useAuthenticated() {
    const repository = AppConfig.di.get(AppConfig.DIQ.UserRepository);
    return repository.isAuth()
}

export function useLoginRedirect(loginUrl: string) {
    const location = useLocation()
    const navigate = useNavigate();
    return () => {
        const origin = location.pathname + location.search
        const url = loginUrl + "?redirect=" + Base64.encode(origin)
        navigate(url, {replace: true});
    }
}

export function useLoginPostRedirect(defaultUrl: string) {
    const navigate = useNavigate();
    const queryParams = useQuery()
    const redirectUrl = optional(Base64.decodeOrNull(queryParams.get("redirect"))).getValueOr(defaultUrl)
    return () => navigate(redirectUrl)
}

export function useHandleUnauthorized() {
    const redirect = useLoginRedirect("/login");
    return () => {
        redirect()
    }
}