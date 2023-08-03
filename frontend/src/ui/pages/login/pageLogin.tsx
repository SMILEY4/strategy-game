import React, {ReactElement, useState} from "react";
import {BgPanel} from "../../components/backgroundpanel/BgPanel";
import {DecoratedPanel} from "../../components/decoratedpanel/DecoratedPanel";
import {TextInput} from "../../components/textinputfield/TextInput";
import {Button} from "../../components/button/Button";
import "./pageLogin.css";


export function PageLogin(): ReactElement {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <BgPanel className="page-login" type="blue">
            <DecoratedPanel className="page-login__content">
                <h1>Welcome!</h1>
                <TextInput value={"E-Mail"} onAccept={setEmail} type="email" disabled={false}/>
                <TextInput value={"Password"} onAccept={setPassword} type="password" disabled={false}/>
                <Button onClick={login}>Login</Button>
                <p>Register</p>
            </DecoratedPanel>
        </BgPanel>
    );

    function login() {
        console.log("login", {email: email, password: password});
    }

}