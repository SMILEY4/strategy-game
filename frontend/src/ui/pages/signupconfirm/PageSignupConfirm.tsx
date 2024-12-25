import React, {ReactElement} from "react";
import {BackgroundImagePanel} from "../../components/panels/backgroundimage/BackgroundImagePanel";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {Header1} from "../../components/header/Header";
import {HBox} from "../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {Text} from "../../components/text/Text";
import {Spacer} from "../../components/spacer/Spacer";
import {GotoHooks} from "../../hooks/goto";


export function PageSignupConfirm(): ReactElement {

    const gotoLogin = GotoHooks.useLogin();

    return (
        <BackgroundImagePanel fillParent centerContent image="/images/image_2.bmp">
            <DecoratedPanel floating>
                <VBox gap_s centerVertical stretch>

                    <Header1>Confirm E-Mail</Header1>

                    <Spacer size="s"/>

                    <Text>A confirmation email has been sent to the specified address.</Text>
                    <Text>Complete the signup by clicking the link in the email.</Text>

                    <Spacer size="s"/>

                    <HBox centerVertical right>
                        <ButtonPrimary info onClick={gotoLogin}>
                            Return to Login
                        </ButtonPrimary>
                    </HBox>

                </VBox>
            </DecoratedPanel>
        </BackgroundImagePanel>
    );

}