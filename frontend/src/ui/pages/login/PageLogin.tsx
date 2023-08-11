import React, {ReactElement, useState} from "react";
import {PanelDecorated} from "../../components/objects/panels/decorated/PanelDecorated";
import {PanelCloth} from "../../components/objects/panels/cloth/PanelCloth";
import {useLogin, useLoginPostRedirect} from "../../hooks/user";
import {useNavigate} from "react-router-dom";
import "./pageLogin.css";
import {ButtonOutline} from "../../components/button/outline/ButtonOutline";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {TextFieldPrimary} from "../../components/textfield/primary/TextFieldPrimary";


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

                <TextFieldPrimary
                    value={email}
                    placeholder="Email Address"
                    type="email"
                    borderType="silver"
                    onChange={setEmail}
                />

                <TextFieldPrimary
                    value={password}
                    placeholder={"Password"}
                    type="password"
                    borderType="silver"
                    onChange={setPassword}
                />

                {error && (
                    <div className="login-error">{error}</div>
                )}

                <div className="login-actions">
                    <ButtonOutline onClick={signUp}>Sign up</ButtonOutline>
                    <ButtonPrimary onClick={login}>Login</ButtonPrimary>
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