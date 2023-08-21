import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import "./countryWindow.less";

export interface CountryWindowProps {
    windowId: string;
    countryId: string,
}

export function CountryWindow(props: CountryWindowProps): ReactElement {

    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            style={{
                minWidth: "fit-content",
                minHeight: "300px",
            }}
            noPadding
        >
            <VBox fillParent>

                <Banner spaceAbove>
                    <Header1 centered>Sampleland</Header1>
                </Banner>

                <VBox className="window-content" scrollable fillParent gap_s top stretch padding_l>

                    <InsetPanel>
                        <Text>Size: 3</Text>
                        <Text>Population: 43,043</Text>
                        <Text>Settlers: 4</Text>
                    </InsetPanel>

                    <Spacer size="s"/>

                    <Header2 centered>Cities</Header2>
                    <Divider/>

                    <InsetPanel>
                        <VBox fillParent gap_s top stretch>
                            <DecoratedPanel blue simpleBorder><Text>Augsburg</Text></DecoratedPanel>
                            <DecoratedPanel blue simpleBorder><Text>Nuremberg</Text></DecoratedPanel>
                            <DecoratedPanel blue simpleBorder><Text>Munich</Text></DecoratedPanel>
                        </VBox>
                    </InsetPanel>

                </VBox>

            </VBox>

        </DecoratedWindow>
    );

}


export function useOpenCountryWindow() {
    const addWindow = useOpenWindow();
    return (countryId: string, isPlayerCountry: boolean) => {
        const WINDOW_ID = isPlayerCountry ? "menubar-window" : "country-window." + countryId;
        addWindow({
            id: WINDOW_ID,
            className: "country-window",
            left: isPlayerCountry ? 125 : 30,
            top: 60,
            width: 360,
            height: 400,
            content: <CountryWindow windowId={WINDOW_ID} countryId={countryId}/>,
        });
    };
}
