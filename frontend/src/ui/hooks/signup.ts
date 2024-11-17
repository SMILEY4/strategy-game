import {useState} from "react";
import {useGotoSignupConfirm} from "./navigate";
import {useDI} from "../../appContext";
import {UserService} from "../../logic/user/userService";

export function useSignup() {

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const gotoSignupConfirm = useGotoSignupConfirm();
	const userService = useDI<UserService>(UserService.name);

	function signup() {
		if (!email) {
			setError("Email address is missing!");
			return;
		}
		if (!password) {
			setError("Password is missing!");
			return;
		}
		if (!username) {
			setError("Username is missing!");
			return;
		}
		return userService.signup(email, password, username)
			.then(() => gotoSignupConfirm())
			.catch(e => setError("Internal Error: " + e));
	}

	return {
		username: username,
		setUsername: setUsername,
		email: email,
		setEmail: setEmail,
		password: password,
		setPassword: setPassword,
		signUp: signup,
		error: error,
	};
}