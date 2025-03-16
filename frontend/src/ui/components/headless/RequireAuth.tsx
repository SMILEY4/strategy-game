import {useEffect} from "react";
import {GotoHooks} from "../../pages/goto";
import {App} from "../../../appContext";

export function RequireAuth(props: { loginUrl: string, children: any }) {

	const authenticated = App.userProxy.isAuthenticated();
	const gotoLoginRedirect = GotoHooks.useLoginRedirect(props.loginUrl);

	useEffect(() => {
		if (!authenticated) {
			console.warn("Not authenticated. Redirecting to login-page.");
			gotoLoginRedirect();
		}
	});

	return props.children;
}

