import {useEffect} from "react";
import {useGotoLoginRedirect} from "../../hooks/navigate";
import {useAuthenticated} from "../../hooks/authentication";

export function RequireAuth(props: { loginUrl: string, children: any }) {

    const authenticated = useAuthenticated();
    const gotoLoginRedirect = useGotoLoginRedirect(props.loginUrl)

    useEffect(() => {
        if (!authenticated) {
            console.warn("Not authenticated. Redirecting to login-page.")
            gotoLoginRedirect()
        }
    });

    return props.children;
}

