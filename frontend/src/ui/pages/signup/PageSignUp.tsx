import React, {ReactElement, useState} from "react";
import {PanelDecorated} from "../../components/objects/panels/decorated/PanelDecorated";
import {PanelCloth} from "../../components/objects/panels/cloth/PanelCloth";
import {useNavigate} from "react-router-dom";
import {useSignup} from "../../hooks/user";
import {TextField} from "../../components/textfield/TextField";
import {ButtonOutline} from "../../components/button/outline/ButtonOutline";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import "./pageSignUp.css";


export function PageSignUp(): ReactElement {

    const {
        username,
        email,
        password,
        error,
        setUsername,
        setEmail,
        setPassword,
        signUp,
        login,
    } = usePageSignUp();

    return (
        <PanelCloth className="page-signup" color="blue">
            <PanelDecorated classNameContent="page-signup__content">

                <h1>Sign Up</h1>

                <TextField
                    value={username}
                    onAccept={setUsername}
                    placeholder="Username"
                    type="text"
                    borderType="silver"
                />

                <TextField
                    value={email}
                    onAccept={setEmail}
                    placeholder="Email Address"
                    type="email"
                    borderType="silver"
                />

                <TextField
                    value={password}
                    onAccept={setPassword}
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


function usePageSignUp() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const signup = useSignup();
    const navigate = useNavigate();

    function changeUsername(value: string) {
        setUsername(value);
        setError(null);
    }

    function changeEmail(value: string) {
        setEmail(value);
        setError(null);
    }

    function changePassword(value: string) {
        setPassword(value);
        setError(null);
    }

    function login() {
        navigate("/login");
    }

    function signUp() {
        if (!username) {
            setError("Username is missing!");
            return;
        }
        if (!email) {
            setError("Email address is missing!");
            return;
        }
        if (!password) {
            setError("Password is missing!");
            return;
        }
        signup(email, password, username)
            .then(() => navigate("/signup/confirm"))
            .catch(e => setError("Error: " + e));
    }

    return {
        username: username,
        email: email,
        password: password,
        error: error,
        setUsername: changeUsername,
        setEmail: changeEmail,
        setPassword: changePassword,
        signUp: signUp,
        login: login,
    };

}