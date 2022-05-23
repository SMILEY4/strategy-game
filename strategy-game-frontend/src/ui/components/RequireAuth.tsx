import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Hooks} from "../../core/hooks";

export function RequireAuth(props: { loginUrl: string, children: any }) {

    const isAuthenticated = Hooks.useIsAuthenticated();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(props.loginUrl, {replace: true});
        }
    });

    return props.children;
}
