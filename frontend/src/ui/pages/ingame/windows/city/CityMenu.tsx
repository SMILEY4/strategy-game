import React, {ReactElement, useState} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {BiChevronDown, BiChevronRight, RiVipCrown2Fill, RiVipCrown2Line} from "react-icons/all";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import {useOpenProvinceWindow} from "../province/ProvinceWindow";
import {MockData} from "../../mockData";
import {useOpenCountryWindow} from "../country/CountryWindow";


export function useOpenCityWindow() {
    const addWindow = useOpenWindow();
    return (cityId: string) => {
        const WINDOW_ID = "menubar-window";
        addWindow({
            id: WINDOW_ID,
            className: "city-window",
            left: 125,
            top: 60,
            width: 360,
            height: 400,
            content: <CityWindow windowId={WINDOW_ID} cityId={cityId}/>,
        });
    };
}


export interface CountryWindowProps {
    windowId: string;
    cityId: string,
}

interface CityWindowData {
    cityId: string,
    cityName: string
    isCountryCapitol: boolean,
    isProvinceCapitol: boolean,
    provinceId: string,
    provinceName: string,
    countryId: string,
    countryName: string,
}


export function CityWindow(props: CountryWindowProps): ReactElement {

    const data: CityWindowData = MockData.getCityData(props.cityId) as CityWindowData;

    const openCountryWindow = useOpenCountryWindow();
    const openProvinceWindow = useOpenProvinceWindow();

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
                    <Header1 centered>{data.cityName}</Header1>
                </Banner>

                <VBox className="window-content" scrollable fillParent gap_s stableScrollbar top stretch padding_m>

                    <InsetPanel>
                        <HBox gap_s centerVertical>
                            <Text fillParent align="right">Id:</Text>
                            <Text fillParent align="left">{data.cityId}</Text>
                        </HBox>
                        <HBox gap_s centerVertical>
                            <Text fillParent align="right">Country:</Text>
                            <LinkButton fillParent align="left" onClick={() => openCountryWindow(data.countryId, true)}>{data.countryName}</LinkButton>
                        </HBox>
                        <HBox gap_s centerVertical>
                            <Text fillParent align="right">Province:</Text>
                            <LinkButton fillParent align="left" onClick={() => openProvinceWindow(data.provinceId)}>{data.provinceName}</LinkButton>
                        </HBox>
                    </InsetPanel>

                </VBox>

            </VBox>

        </DecoratedWindow>
    );

}
