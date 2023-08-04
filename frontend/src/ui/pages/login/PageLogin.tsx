import React, {ReactElement, useState} from "react";
import {TextInput} from "../../components/controls/textinputfield/TextInput";
import {ButtonGem} from "../../components/controls/button/gem/ButtonGem";
import {PanelDecorated} from "../../components/panels/decorated/PanelDecorated";
import {ButtonText} from "../../components/controls/button/text/ButtonText";
import "./pageLogin.css";
import {PanelCloth} from "../../components/panels/cloth/PanelCloth";
import {useNavigate} from "react-router-dom";
import {AppConfig} from "../../../main";


export function PageLogin(): ReactElement {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const actionLogIn = AppConfig.di.get(AppConfig.DIQ.UserLoginAction);
    const navigate = useNavigate();

    return (
        <PanelCloth className="page-login" color="blue">
            <PanelDecorated classNameContent="page-login__content">

                <h1>Login</h1>

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
                    <div className="login-error">{error}</div>
                )}

                <div className="login-actions">
                    <ButtonText onClick={signUp}>Sign up</ButtonText>
                    <ButtonGem onClick={login}>Login</ButtonGem>
                </div>


            </PanelDecorated>
        </PanelCloth>
    );

    function login() {
        if(!email) {
            setError("Email address is missing!")
            return
        }
        if(!password) {
            setError("Password is missing!")
            return
        }
        actionLogIn.perform(email, password)
            .then(() => navigate("/home"))
            .catch(e => {
                setError("Error: " + e)
            })
    }

    function signUp() {
        navigate("/signup");
    }

}