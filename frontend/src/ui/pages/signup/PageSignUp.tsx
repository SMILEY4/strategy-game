import React, {ReactElement, useState} from "react";
import {TextInput} from "../../components/controls/textinputfield/TextInput";
import {ButtonGem} from "../../components/controls/button/gem/ButtonGem";
import {PanelDecorated} from "../../components/panels/decorated/PanelDecorated";
import {ButtonText} from "../../components/controls/button/text/ButtonText";
import "./pageSignUp.css";
import {PanelCloth} from "../../components/panels/cloth/PanelCloth";
import {useNavigate} from "react-router-dom";


export function PageSignUp(): ReactElement {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    return (
        <PanelCloth className="page-signup" color="blue">
            <PanelDecorated classNameContent="page-signup__content">

                <h1>Sign Up</h1>

                <TextInput
                    value={username}
                    onAccept={value => {
                        setUsername(value)
                        setError(null)
                    }}
                    placeholder="Username"
                    type="text"
                    border="silver"
                />

                <TextInput
                    value={email}
                    onAccept={value => {
                        setEmail(value)
                        setError(null)
                    }}
                    placeholder="Email Address"
                    type="email"
                    border="silver"
                />

                <TextInput
                    value={password}
                    onAccept={value => {
                        setPassword(value)
                        setError(null)
                    }}
                    placeholder={"Password"}
                    type="password"
                    border="silver"
                />

                {error && (
                    <div className="signup-error">{error}</div>
                )}

                <div className="signup-actions">
                    <ButtonText onClick={login}>Log-In</ButtonText>
                    <ButtonGem onClick={login}>Sign Up</ButtonGem>
                </div>


            </PanelDecorated>
        </PanelCloth>
    );

    function login() {
        navigate("/login");
    }

    function signUp() {
    }

}