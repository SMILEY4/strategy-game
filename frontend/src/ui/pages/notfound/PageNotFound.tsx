import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {Header1} from "../../components/static/header/Header";
import {VBox} from "../../components/layout/vbox/VBox";
import {BackgroundImagePanel} from "../../components/panels/backgroundimage/BackgroundImagePanel";
import {Text} from "../../components/static/text/Text";


export function PageNotFound(): ReactElement {
    return (
        <BackgroundImagePanel fillParent centerContent image="/images/image_4.bmp">
            <DecoratedPanel red floating>
                <VBox centerVertical left>
                    <Header1>404</Header1>
                    <Text>The requested page does not exist.</Text>
                </VBox>
            </DecoratedPanel>
        </BackgroundImagePanel>
    );
}