import {useEffect} from "react";
import {AuthHooks} from "../../hooks/authentication";
import {GotoHooks} from "../../hooks/goto";
import {App} from "../../../appContext";
import {LocalStateHooks} from "../../../state/localStateHooks";

export function RequireAuth(props: { loginUrl: string, children: any }) {

    const authenticated= LocalStateHooks.useIsAuthenticated()
    const gotoLoginRedirect = GotoHooks.useLoginRedirect(props.loginUrl)

    useEffect(() => {
        if (!authenticated) {
            console.warn("Not authenticated. Redirecting to login-page.")
            gotoLoginRedirect()
        }
    });

    return props.children;
}

