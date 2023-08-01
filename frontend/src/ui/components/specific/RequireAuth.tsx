import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useIsAuthenticated} from "../../../core/hooks/useIsAuthenticated";
import {AppConfig} from "../../../main";
import {useBeforeRender} from "./useBeforeRender";

const DEV_USERNAME = import.meta.env.PUB_DEV_USERNAME;
const DEV_PASSWORD = import.meta.env.PUB_DEV_PASSWORD;

export function RequireAuth(props: { loginUrl: string, children: any }) {

    const isAuthenticated = useIsAuthenticated();
    const navigate = useNavigate();
    const actionLogIn = AppConfig.di.get(AppConfig.DIQ.UserLoginAction);

    useBeforeRender(() => {
        if (!isAuthenticated && DEV_USERNAME && DEV_PASSWORD) {
            actionLogIn.perform(DEV_USERNAME, DEV_PASSWORD)
                .then(() => navigate("/home"))
                .catch(e => console.error("Error during login", e));
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(props.loginUrl, {replace: true});
        }
    });

    return props.children;
}

