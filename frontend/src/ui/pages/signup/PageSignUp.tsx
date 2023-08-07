import React, {ReactElement, useState} from "react";
import {TextInput} from "../../components/controls/textinputfield/TextInput";
import {ButtonGem} from "../../components/controls/button/gem/ButtonGem";
import {PanelDecorated} from "../../components/panels/decorated/PanelDecorated";
import {ButtonText} from "../../components/controls/button/text/ButtonText";
import "./pageSignUp.css";
import {PanelCloth} from "../../components/panels/cloth/PanelCloth";
import {useNavigate} from "react-router-dom";
import {AppConfig} from "../../../main";
import {useSignup} from "../../hooks/user";


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

                <TextInput
                    value={username}
                    onAccept={setUsername}
                    placeholder="Username"
                    type="text"
                    border="silver"
                />

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
                    <div className="signup-error">{error}</div>
                )}

                <div className="signup-actions">
                    <ButtonText onClick={login}>Log-In</ButtonText>
                    <ButtonGem onClick={signUp}>Sign Up</ButtonGem>
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