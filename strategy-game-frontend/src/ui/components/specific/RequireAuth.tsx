import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Hooks} from "../../../core/hooks";
import {UserStateHooks} from "../../../external/state/user/userStateHooks";

export function RequireAuth(props: { loginUrl: string, children: any }) {

    const isAuthenticated = UserStateHooks.useIsAuthenticated();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(props.loginUrl, {replace: true});
        }
    });

    return props.children;
}
