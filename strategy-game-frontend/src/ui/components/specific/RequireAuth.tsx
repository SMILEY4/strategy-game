import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useIsAuthenticated} from "../../../core/hooks/useIsAuthenticated";

export function RequireAuth(props: { loginUrl: string, children: any }) {

    const isAuthenticated = useIsAuthenticated();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(props.loginUrl, {replace: true});
        }
    });

    return props.children;
}
