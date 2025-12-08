import {useState} from "react";
import {GotoHooks} from "../goto";
import {useAuth} from "../../../app/authentication/AuthContext";

export namespace LoginHooks {

	export function useLogin() {

        const auth = useAuth();
        const [email, setEmail] = useState("");
		const [password, setPassword] = useState("");
		const [error, setError] = useState<string | null>(null);
		const gotoLoginRedirect = GotoHooks.useLoginRedirect("/sessions");

		function login() {
			if (!email) {
				setError("Email address is missing!");
				return;
			}
			if (!password) {
				setError("Password is missing!");
				return;
			}
			return auth.login(email, password)
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

}