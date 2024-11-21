import {useEffect} from "react";
import {AuthHooks} from "../../hooks/authentication";
import {GotoHooks} from "../../hooks/goto";

export function RequireAuth(props: { loginUrl: string, children: any }) {

    const authenticated = AuthHooks.useAuthenticated();
    const gotoLoginRedirect = GotoHooks.useLoginRedirect(props.loginUrl)

    useEffect(() => {
        if (!authenticated) {
            console.warn("Not authenticated. Redirecting to login-page.")
            gotoLoginRedirect()
        }
    });

    return props.children;
}

