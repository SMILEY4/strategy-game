import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {Header1} from "../../components/header/Header";
import {HBox} from "../../components/layout/hbox/HBox";
import {Button} from "../../components/button/primary/Button";
import {Text} from "../../components/text/Text";
import {Spacer, VSpacer} from "../../components/spacer/Spacer";
import {GotoHooks} from "../../hooks/goto";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";
import {Divider} from "../../components/divider/Divider";


export function PageSignupConfirm(): ReactElement {

    const gotoLogin = GotoHooks.useLogin();

    return (
        <BackgroundPanel image="/images/image_2.bmp">

            <DecoratedPanel ornament>
                <VBox padding_l centerVertical gap_s>

                    <Header1>Confirm E-Mail</Header1>

                    <Divider line/>

                    <Text>A confirmation email has been sent to the specified address.</Text>
                    <Text>Complete the signup by clicking the link in the email.</Text>

                    <VSpacer size_s/>

                    <HBox right>
                        <Button info onClick={gotoLogin}>Return to Login</Button>
                    </HBox>

                </VBox>
            </DecoratedPanel>

        </BackgroundPanel>
    );

}