import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {Header1} from "../../components/header/Header";
import {TextField} from "../../components/textfield/TextField";
import {HBox} from "../../components/layout/hbox/HBox";
import {Button} from "../../components/button/Button";
import {VSpacer} from "../../components/spacer/Spacer";
import {SignupHooks} from "./signup";
import {GotoHooks} from "../../hooks/goto";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";


export function PageSignUp(): ReactElement {

    const {
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        signUp,
        error,
    } = SignupHooks.useSignup();

    const gotoLogin = GotoHooks.useLogin();

    return (
        <BackgroundPanel image="/images/image_3.bmp">

            <DecoratedPanel ornament>
                <VBox padding_l centerVertical gap_s>

                    <Header1>Sign-Up</Header1>

                    <VSpacer size_s/>

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

                    <VSpacer size_s/>

                    <HBox right gap_s>
                        <Button info onClick={gotoLogin}>Login</Button>
                        <Button success onClick={signUp}>Sign-Up</Button>
                    </HBox>

                </VBox>
            </DecoratedPanel>

        </BackgroundPanel>
    );
}
