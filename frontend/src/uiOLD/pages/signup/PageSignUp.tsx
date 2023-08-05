import React, {ReactElement, useState} from "react";
import {useNavigate} from "react-router-dom";
import {AppConfig} from "../../../main";
import "./pageSignUp.css";

export function PageSignUp(): ReactElement {

    const actionSignUp = AppConfig.di.get(AppConfig.DIQ.UserSignUpAction);
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");
    const [signUpUsername, setSignUpUsername] = useState("");
    const [signUpStatus, setSignUpStatus] = useState("");
    const navigate = useNavigate();

    return (
        <div className="page-signup">
            <div>
                <h3>Sign-Up</h3>
                <div>Email</div>
                <input type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value + "")}/>
                <div>Username</div>
                <input type="text" value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value + "")}/>
                <div>Password</div>
                <input type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value + "")}/>
                <div/>
                <button onClick={onSignUp}>SignUp</button>
                <div>{signUpStatus}</div>
            </div>
        </div>
    );

    function onSignUp() {
        actionSignUp.perform(signUpEmail, signUpPassword, signUpUsername)
            .then(() => setSignUpStatus("Confirmation code sent"))
            .then(() => navigate("/login"))
            .catch(e => {
                console.error(e);
                setSignUpStatus("Sign-Up failed");
            });
    }

}