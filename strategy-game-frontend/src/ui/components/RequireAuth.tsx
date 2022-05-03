import {UserState} from "../../state/userState";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

export function RequireAuth(props: { loginUrl: string, children: any }) {

	const isAuthenticated = UserState.useState(state => state.isAuthenticated);
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate(props.loginUrl, {replace: true});
		}
	});

	return props.children;
}