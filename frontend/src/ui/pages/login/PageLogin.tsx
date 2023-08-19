import React, {ReactElement, useState} from "react";
import * as user from "../../hooks/user";
import {useNavigate} from "react-router-dom";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {Header1} from "../../components/static/header/Header";
import {BackgroundImagePanel} from "../../components/panels/backgroundimage/BackgroundImagePanel";
import {TextField} from "../../components/textfield/TextField";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {HBox} from "../../components/layout/hbox/HBox";


export function PageLogin(): ReactElement {

    const {
        email,
        password,
        error,
        setEmail,
        setPassword,
        setError,
    } = useLoginData();
    const login = useLogin(email, password, setError);
    const signUp = useSignUp();

    return (
        <BackgroundImagePanel fillParent centerContent image="./images/image_1.png">
            <DecoratedPanel red floating>
                <VBox centerVertical stretch>

                    <Header1>Login</Header1>

                    <TextField
                        value={email}
                        placeholder={"Email"}
                        type="email"
                        onChange={setEmail}
                    />

                    <TextField
                        value={password}
                        placeholder={"Password"}
                        type="password"
                        onChange={setPassword}
                    />

                    <div/>

                    <HBox centerVertical right>
                        <ButtonPrimary blue onClick={signUp}>
                            Sign-Up
                        </ButtonPrimary>
                        <ButtonPrimary green onClick={login}>
                            Login
                        </ButtonPrimary>
                    </HBox>


                </VBox>
            </DecoratedPanel>
        </BackgroundImagePanel>
    )
}


function useLoginData() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    return {
        email: email,
        setEmail: (value: string) => {
            setEmail(value);
            setError(null);
        },
        password: password,
        setPassword: (value: string) => {
            setPassword(value);
            setError(null);
        },
        error: error,
        setError: setError,
    };
}

function useLogin(email: string, password: string, setError: (error: string) => void) {
    const login = user.useLogin();
    const loginRedirect = user.useLoginPostRedirect("/sessions");
    return () => {
        if (!email) {
            setError("Email address is missing!");
        }
        if (!password) {
            setError("Password is missing!");
        }
        login(email, password)
            .then(() => loginRedirect())
            .catch(e => setError("Error: " + e));
    };
}

function useSignUp() {
    const navigate = useNavigate();
    return () => {
        navigate("/signup");
    };
}
