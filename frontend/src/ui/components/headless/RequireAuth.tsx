import {useEffect} from "react";
import {GotoHooks} from "../../pages/goto";
import {UserStateHooks} from "../../../state/userStateHooks";

export function RequireAuth(props: { loginUrl: string, children: any }) {

    const authenticated= UserStateHooks.useIsAuthenticated()
    const gotoLoginRedirect = GotoHooks.useLoginRedirect(props.loginUrl)

    useEffect(() => {
        if (!authenticated) {
            console.warn("Not authenticated. Redirecting to login-page.")
            gotoLoginRedirect()
        }
    });

    return props.children;
}

