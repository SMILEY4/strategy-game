import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {Header1} from "../../components/header/Header";
import {VBox} from "../../components/layout/vbox/VBox";
import {Text} from "../../components/text_basic/Text";
import {VSpacer} from "../../components/spacer/Spacer";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";


export function PageNotFound(): ReactElement {
    return (
        <BackgroundPanel image="/images/image_4.bmp">
            <DecoratedPanel ornament>
                <VBox padding_l centerVertical left gap_s>
                    <Header1>404</Header1>
                    <VSpacer size_s/>
                    <Text>The requested page does not exist.</Text>
                </VBox>
            </DecoratedPanel>
        </BackgroundPanel>
    );
}