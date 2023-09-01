import React, {ReactElement} from "react";
import {BackgroundImagePanel} from "../../components/panels/backgroundimage/BackgroundImagePanel";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {Header1} from "../../components/header/Header";
import {TextField} from "../../components/textfield/TextField";
import {HBox} from "../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../components/spacer/Spacer";
import {useSignup} from "../../hooks/user/signup";
import {useGotoLogin} from "../../hooks/navigate";


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
    } = useSignup();
    const gotoLogin = useGotoLogin();

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
                        <ButtonPrimary blue onClick={gotoLogin}>
                            Login
                        </ButtonPrimary>
                        <ButtonPrimary green onClick={signUp}>
                            Sign-Up
                        </ButtonPrimary>
                    </HBox>

                </VBox>
            </DecoratedPanel>
        </BackgroundImagePanel>
    );
}
