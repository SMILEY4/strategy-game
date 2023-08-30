import {AppConfig} from "../../main";
import {useState} from "react";
import {useGotoLoginRedirect} from "./navigate";

export function useLogin() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const gotoLoginRedirect = useGotoLoginRedirect("/sessions");
    const action = AppConfig.di.get(AppConfig.DIQ.UserLoginAction);

    function login() {
        if (!email) {
            setError("Email address is missing!");
            return;
        }
        if (!password) {
            setError("Password is missing!");
            return;
        }
        return action.perform(email, password)
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
    }

}