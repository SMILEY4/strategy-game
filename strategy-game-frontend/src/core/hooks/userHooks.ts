import {Game} from "../game";
import {UserAuthData} from "../../state/models/UserAuthData";
import {UserState} from "../../state/userState";
import {useNavigate} from "react-router-dom";

export namespace UserHooks {

	export function useAuth() {
		const idToken = UserState.useState(state => state.idToken);
		return {
			isAuthenticated: !!idToken,
			idToken: idToken
		};
	}

	export function useLogIn(targetUrl: string) {
		const client = Game.client;
		const setAuth = UserState.useState(state => state.setAuth);
		const navigate = useNavigate();
		return (email: String, password: String) => {
			return client.login(email, password).then((authData: UserAuthData) => {
				setAuth(authData.idToken);
				navigate(targetUrl);
			});
		};
	}

	export function useLogOut(targetUrl: string) {
		const clearAuth = UserState.useState(state => state.clearAuth);
		const navigate = useNavigate();
		return () => {
			clearAuth();
			navigate(targetUrl);
		};
	}

	export function useSignUp() {
		const client = Game.client;
		return (email: String, password: String, username: String) => {
			return client.signUp(email, password, username);
		};
	}

}