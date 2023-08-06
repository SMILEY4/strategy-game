import React, {ReactElement, useState} from "react";
import {TextInput} from "../../components/controls/textinputfield/TextInput";
import {ButtonGem} from "../../components/controls/button/gem/ButtonGem";
import {PanelDecorated} from "../../components/panels/decorated/PanelDecorated";
import {ButtonText} from "../../components/controls/button/text/ButtonText";
import {PanelCloth} from "../../components/panels/cloth/PanelCloth";
import {useLogin, useLoginPostRedirect} from "../../hooks/user";
import {useNavigate} from "react-router-dom";
import "./pageLogin.css";
import {useQuery} from "../../components/misc/useQuery";
import {optional} from "../../../shared/optional";
import {Base64} from "../../../shared/base64";


export function PageLogin(): ReactElement {

    const {
        email,
        password,
        error,
        setEmail,
        setPassword,
        login,
        signUp
    } = usePageLogin()

    return (
        <PanelCloth className="page-login" color="blue">
            <PanelDecorated classNameContent="page-login__content">

                <h1>Login</h1>

                <TextInput
                    value={email}
                    onAccept={setEmail}
                    placeholder="Email Address"
                    type="email"
                    border="silver"
                />

                <TextInput
                    value={password}
                    onAccept={setPassword}
                    placeholder={"Password"}
                    type="password"
                    border="silver"
                />

                {error && (
                    <div className="login-error">{error}</div>
                )}

                <div className="login-actions">
                    <ButtonText onClick={signUp}>Sign up</ButtonText>
                    <ButtonGem onClick={login}>Login</ButtonGem>
                </div>

            </PanelDecorated>
        </PanelCloth>
    );
}


function usePageLogin() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const login = useLogin()
    const loginRedirect = useLoginPostRedirect("/sessions")


    function changeEmail(value: string) {
        setEmail(value)
        setError(null)
    }


    function changePassword(value: string) {
        setPassword(value)
        setError(null)
    }

    function requestLogin() {
        if (!email) {
            setError("Email address is missing!");
            return;
        }
        if (!password) {
            setError("Password is missing!");
            return;
        }
        login(email, password)
            .then(() => loginRedirect())
            .catch(e => setError("Error: " + e));
    }

    function signUp() {
        navigate("/signup");
    }

    return {
        email: email,
        password: password,
        error: error,
        setEmail: changeEmail,
        setPassword: changePassword,
        login: requestLogin,
        signUp: signUp,
    };
}