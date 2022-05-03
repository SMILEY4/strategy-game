import React, {ReactElement, useState} from "react";
import "./pageLogin.css";
import {UserHooks} from "../../../core/hooks/userHooks";
import {useNavigate} from "react-router-dom";

export function PageLogin(): ReactElement {

	const [loginEmail, setLoginEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");
	const [loginStatus, setLoginStatus] = useState("");
	const navigate = useNavigate();
	const login = UserHooks.useLogIn("/home");

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
		login(loginEmail, loginPassword)
			.catch(e => {
				console.error(e);
				setLoginStatus("Login failed");
			});
	}

	function onSignUp() {
		navigate("/signup")
	}

}