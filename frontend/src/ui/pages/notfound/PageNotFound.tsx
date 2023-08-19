import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {Header1} from "../../components/static/header/Header";
import {VBox} from "../../components/layout/vbox/VBox";
import {BackgroundImagePanel} from "../../components/panels/backgroundimage/BackgroundImagePanel";
import {Text} from "../../components/static/text/Text";
import {Spacer} from "../../components/static/spacer/Spacer";


export function PageNotFound(): ReactElement {
    return (
        <BackgroundImagePanel fillParent centerContent image="/images/image_4.bmp">
            <DecoratedPanel red floating>
                <VBox gap_s centerVertical left>
                    <Header1>404</Header1>
                    <Spacer size="s"/>
                    <Text>The requested page does not exist.</Text>
                </VBox>
            </DecoratedPanel>
        </BackgroundImagePanel>
    );
}