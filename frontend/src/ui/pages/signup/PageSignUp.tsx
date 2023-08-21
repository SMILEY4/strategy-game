import React, {ReactElement, useState} from "react";
import {useNavigate} from "react-router-dom";
import * as user from "../../hooks/user";
import {BackgroundImagePanel} from "../../components/panels/backgroundimage/BackgroundImagePanel";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {Header1} from "../../components/header/Header";
import {TextField} from "../../components/textfield/TextField";
import {HBox} from "../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../components/spacer/Spacer";


export function PageSignUp(): ReactElement {

    const {
        username,
        email,
        password,
        error,
        setUsername,
        setEmail,
        setPassword,
        setError,
    } = useSignUpData();
    const signUp = useSignUp(email, password, username, setError);
    const login = useLogin();

    return (
        <BackgroundImagePanel fillParent centerContent image="/images/image_3.bmp">
            <DecoratedPanel red floating>
                <VBox gap_s centerVertical stretch>

                    <Header1>Sign-Up</Header1>

                    <Spacer size="s"/>

                    <TextField
                        value={username}
                        placeholder={"Username"}
                        type="text"
                        onChange={setUsername}
                    />

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

                    <Spacer size="s"/>

                    <HBox gap_s centerVertical right>
                        <ButtonPrimary blue onClick={login}>
                            Login
                        </ButtonPrimary>
                        <ButtonPrimary green onClick={signUp}>
                            Sign-Up
                        </ButtonPrimary>
                    </HBox>


                </VBox>
            </DecoratedPanel>
        </BackgroundImagePanel>
    )
}

function useSignUpData() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    return {
        username: username,
        email: email,
        password: password,
        error: error,
        setUsername: (value: string) => {
            setUsername(value);
            setError(null);
        },
        setEmail: (value: string) => {
            setEmail(value);
            setError(null);
        },
        setPassword: (value: string) => {
            setPassword(value);
            setError(null);
        },
        setError: setError,
    };

}


function useSignUp(email: string, password: string, username: string, setError: (error: string) => void) {
    const signup = user.useSignup();
    const navigate = useNavigate();
    return () => {
        if (!email) {
            setError("Email address is missing!");
        }
        if (!password) {
            setError("Password is missing!");
        }
        if (!username) {
            setError("Username is missing!");
        }
        return signup(email, password, username)
            .then(() => navigate("/signup/confirm"))
            .catch(e => setError("Error: " + e));
    };
}

function useLogin() {
    const navigate = useNavigate();
    return () => {
        navigate("/login");
    };
}