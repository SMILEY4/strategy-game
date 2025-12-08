import {type ReactElement, type ReactNode, useEffect, useState} from "react";
import {useAuth} from "./AuthContext";
import {GotoHooks} from "../../ui/pages/goto";

/**
 * Wrap pages requiring user authentication in this component.
 */
export function RequireAuth(props: { loginUrl: string, children: ReactNode }): ReactElement | null {

    const {isAuthenticated} = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const gotoLoginRedirect = GotoHooks.useLoginRedirect(props.loginUrl);

    useEffect(() => {
        if (!isAuthenticated) {
            gotoLoginRedirect();
        } else {
            setIsLoading(false);
        }
    });


    return isLoading
        ? null
        : (<>{props.children}</>);
}