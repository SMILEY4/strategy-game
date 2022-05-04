import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {UserHooks} from "../../core/hooks/userHooks";
import useAuth = UserHooks.useAuth;

export function RequireAuth(props: { loginUrl: string, children: any }) {

	const isAuthenticated = useAuth().isAuthenticated;
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate(props.loginUrl, {replace: true});
		}
	});

	return props.children;
}
