import React, {ReactElement, useState} from "react";
import {TextInput} from "../../components/controls/textinputfield/TextInput";
import {ButtonGem} from "../../components/controls/button/ButtonGem";
import "./pageLogin.css";
import {PanelCloth} from "../../components/panels/cloth/panelCloth";
import {PanelDecorated} from "../../components/panels/decorated/PanelDecorated";


export function PageLogin(): ReactElement {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <PanelCloth className="page-login" color="blue">
            <PanelDecorated classNameContent="page-login__content">
                <h1>Welcome!</h1>
                <TextInput value={"E-Mail"} onAccept={setEmail} type="email" border="silver" disabled={false}/>
                <TextInput value={"Password"} onAccept={setPassword} type="password" border="silver" disabled={false}/>
                <ButtonGem onClick={login}>Login</ButtonGem>
                <p>Register</p>
            </PanelDecorated>
        </PanelCloth>
    );

    function login() {
        console.log("login", {email: email, password: password});
    }

}