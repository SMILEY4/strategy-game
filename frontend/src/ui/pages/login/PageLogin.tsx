import React, {ReactElement, useState} from "react";
import {PanelDecorated} from "../../components/objects/panels/decorated/PanelDecorated";
import {PanelCloth} from "../../components/objects/panels/cloth/PanelCloth";
import * as user from "../../hooks/user";
import {useNavigate} from "react-router-dom";
import {ButtonOutline} from "../../components/button/outline/ButtonOutline";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {TextFieldPrimary} from "../../components/textfield/primary/TextFieldPrimary";
import "./pageLogin.css";


export function PageLogin(): ReactElement {

    const {
        email,
        password,
        error,
        setEmail,
        setPassword,
        setError,
    } = useLoginData();
    const login = useLogin(email, password, setError);
    const signUp = useSignUp();

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


function useLoginData() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    return {
        email: email,
        setEmail: (value: string) => {
            setEmail(value);
            setError(null);
        },
        password: password,
        setPassword: (value: string) => {
            setPassword(value);
            setError(null);
        },
        error: error,
        setError: setError,
    };
}

function useLogin(email: string, password: string, setError: (error: string) => void) {
    const login = user.useLogin();
    const loginRedirect = user.useLoginPostRedirect("/sessions");
    return () => {
        if (!email) {
            setError("Email address is missing!");
        }
        if (!password) {
            setError("Password is missing!");
        }
        login(email, password)
            .then(() => loginRedirect())
            .catch(e => setError("Error: " + e));
    };
}

function useSignUp() {
    const navigate = useNavigate();
    return () => {
        navigate("/signup");
    };
}
