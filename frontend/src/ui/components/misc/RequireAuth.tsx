import {useEffect} from "react";
import {useAuthenticated, useLoginRedirect} from "../../hooks/user";

export function RequireAuth(props: { loginUrl: string, children: any }) {

    const authenticated = useAuthenticated();
    const redirect = useLoginRedirect(props.loginUrl)

    useEffect(() => {
        if (!authenticated) {
            console.warn("Not authenticated. Redirecting to login-page.")
            redirect()
        }
    });

    return props.children;
}

