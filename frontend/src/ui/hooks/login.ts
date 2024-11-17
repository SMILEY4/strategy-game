import {useState} from "react";
import {useGotoLoginRedirect} from "./navigate";
import {useDI} from "../../appContext";
import {UserService} from "../../logic/user/userService";

export function useLogin() {

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const gotoLoginRedirect = useGotoLoginRedirect("/sessions");
	const userService = useDI<UserService>(UserService.name);

	function login() {
		if (!email) {
			setError("Email address is missing!");
			return;
		}
		if (!password) {
			setError("Password is missing!");
			return;
		}
		return userService.login(email, password)
			.then(() => gotoLoginRedirect())
			.catch(e => setError("Internal Error: " + e));
	}

	return {
		email: email,
		setEmail: setEmail,
		password: password,
		setPassword: setPassword,
		login: login,
		error: error,
	};

}