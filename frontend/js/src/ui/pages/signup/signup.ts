import {useState} from "react";
import {GotoHooks} from "../goto";
import {App} from "../../../appContext";

export namespace SignupHooks {

	export function useSignup() {

		const [username, setUsername] = useState("");
		const [email, setEmail] = useState("");
		const [password, setPassword] = useState("");
		const [error, setError] = useState<string | null>(null);
		const gotoSignupConfirm = GotoHooks.useSignupConfirm();

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
			return App.userProxy.signup(email, password, username)
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

}
