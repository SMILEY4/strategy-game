import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {CountryWindowContent} from "./CountryWindowContent";

export interface CountryWindowProps {
    windowId: string;
    countryId: string,
}

export function CountryWindow(props: CountryWindowProps): ReactElement {

    return <div>TODO</div>
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
