import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {Header1} from "../../components/static/header/Header";
import {VBox} from "../../components/layout/vbox/VBox";
import "./pageNotFound.scoped.less";
import {BackgroundImagePanel} from "../../components/panels/backgroundimage/BackgroundImagePanel";


export function PageNotFound(): ReactElement {
    return (
        <BackgroundImagePanel fillParent centerContent>
            <DecoratedPanel red>
                <VBox centerVertical left>
                    <Header1>404</Header1>
                    <p>The requested page does not exist.</p>
                </VBox>
            </DecoratedPanel>
        </BackgroundImagePanel>
    );
}