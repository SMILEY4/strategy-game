import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header2, Header4} from "../../../../components/static/header/Header";
import {Spacer} from "../../../../components/static/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/static/text/Text";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";

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
        >
            <VBox fillParent gap_s top stretch>

                <Header2 banner>Bavaria</Header2>

                <Spacer size="s"/>

                <InsetPanel>
                    <Text>Size: 3</Text>
                    <Text>Population: 43,043</Text>
                    <Text>Settlers: 4</Text>
                </InsetPanel>

                <Spacer size="s"/>

                <Header4 banner>Cities</Header4>

                <InsetPanel>
                    <VBox fillParent gap_s top stretch>
                        <DecoratedPanel blue simpleBorder><Text>Augsburg</Text></DecoratedPanel>
                        <DecoratedPanel blue simpleBorder><Text>Nuremberg</Text></DecoratedPanel>
                        <DecoratedPanel blue simpleBorder><Text>Munich</Text></DecoratedPanel>
                    </VBox>
                </InsetPanel>

            </VBox>
        </DecoratedWindow>
    );
    // return (
    //     <DecoratedWindow
    //         windowId={props.windowId}
    //         classNameContent="country-window__content"
    //         withCloseButton
    //     >
    //         <CountryWindowContent
    //             countryId={props.countryId}
    //             name={"MyCountry"}
    //             settlers={4}
    //             provinces={[
    //                 {
    //                     name: "Bavaria",
    //                     id: "46782",
    //                     cities: [
    //                         {
    //                             name: "Augsburg",
    //                             id: "26978"
    //                         },
    //                         {
    //                             name: "München",
    //                             id: "70340"
    //                         },
    //                         {
    //                             name: "Nürnberg",
    //                             id: "24307"
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     name: "Baden-Württemberg",
    //                     id: "14350",
    //                     cities: [
    //                         {
    //                             name: "Stuttgart",
    //                             id: "52986"
    //                         },
    //                         {
    //                             name: "Heidelberg",
    //                             id: "98673"
    //                         }
    //                     ]
    //                 },
    //             ]}
    //         />
    //     </DecoratedWindow>
    // );

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
