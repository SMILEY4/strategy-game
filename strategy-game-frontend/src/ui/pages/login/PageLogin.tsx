import React, {ReactElement, useState} from "react";
import {useNavigate} from "react-router-dom";
import {AppConfig} from "../../../main";
import "./pageLogin.css";

export function PageLogin(): ReactElement {

    const actionLogIn = AppConfig.di.get(AppConfig.DIQ.UserLoginAction);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginStatus, setLoginStatus] = useState("");
    const navigate = useNavigate();

    return (
        <div className="page-login">

            <div>
                <h3>Login</h3>
                <div>Email</div>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value + "")}/>
                <div>Password</div>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value + "")}/>
                <div/>
                <button onClick={onLogin}>Login</button>
                <div>{loginStatus}</div>
                <p/>
                <button onClick={onSignUp}>Sign-Up</button>
            </div>

        </div>
    );

    function onLogin() {
        actionLogIn.perform(loginEmail, loginPassword)
            .then(() => navigate("/home"))
            .catch(e => {
                console.error("Error during login", e);
                setLoginStatus("Login failed");
            });
    }

    function onSignUp() {
        navigate("/signup");
    }

}