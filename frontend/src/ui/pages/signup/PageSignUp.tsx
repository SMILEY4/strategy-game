import React, {ReactElement, useState} from "react";
import {PanelDecorated} from "../../components/objects/panels/decorated/PanelDecorated";
import {PanelCloth} from "../../components/objects/panels/cloth/PanelCloth";
import {useNavigate} from "react-router-dom";
import {ButtonOutline} from "../../components/button/outline/ButtonOutline";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {TextFieldPrimary} from "../../components/textfield/primary/TextFieldPrimary";
import "./pageSignUp.css";
import * as user from "../../hooks/user";


export function PageSignUp(): ReactElement {

    const {
        username,
        email,
        password,
        error,
        setUsername,
        setEmail,
        setPassword,
        setError,
    } = useSignUpData();
    const signUp = useSignUp(email, password, username, setError);
    const login = useLogin();

    return (
        <PanelCloth className="page-signup" color="blue">
            <PanelDecorated classNameContent="page-signup__content">

                <h1>Sign Up</h1>

                <TextFieldPrimary
                    value={username}
                    onChange={setUsername}
                    placeholder="Username"
                    type="text"
                    borderType="silver"
                />

                <TextFieldPrimary
                    value={email}
                    onChange={setEmail}
                    placeholder="Email Address"
                    type="email"
                    borderType="silver"
                />

                <TextFieldPrimary
                    value={password}
                    onChange={setPassword}
                    placeholder={"Password"}
                    type="password"
                    borderType="silver"
                />

                {error && (
                    <div className="signup-error">{error}</div>
                )}

                <div className="signup-actions">
                    <ButtonOutline onClick={login}>Log-In</ButtonOutline>
                    <ButtonPrimary onClick={signUp}>Sign Up</ButtonPrimary>
                </div>


            </PanelDecorated>
        </PanelCloth>
    );

}

function useSignUpData() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    return {
        username: username,
        email: email,
        password: password,
        error: error,
        setUsername: (value: string) => {
            setUsername(value);
            setError(null);
        },
        setEmail: (value: string) => {
            setEmail(value);
            setError(null);
        },
        setPassword: (value: string) => {
            setPassword(value);
            setError(null);
        },
        setError: setError,
    };

}


function useSignUp(email: string, password: string, username: string, setError: (error: string) => void) {
    const signup = user.useSignup();
    const navigate = useNavigate();
    return () => {
        if (!email) {
            setError("Email address is missing!");
        }
        if (!password) {
            setError("Password is missing!");
        }
        if (!username) {
            setError("Username is missing!");
        }
        return signup(email, password, username)
            .then(() => navigate("/signup/confirm"))
            .catch(e => setError("Error: " + e));
    };
}

function useLogin() {
    const navigate = useNavigate();
    return () => {
        navigate("/login");
    };
}