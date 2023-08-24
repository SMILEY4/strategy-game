import React, {ReactElement} from "react";
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
import {RiVipCrown2Fill, RiVipCrown2Line} from "react-icons/all";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import {useOpenCountryWindow} from "../country/CountryWindow";
import {MockData} from "../../mockData";
import {useOpenCityWindow} from "../city/CityMenu";
import {KeyLinkValuePair, KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";


export function useOpenProvinceWindow() {
    const addWindow = useOpenWindow();
    return (provinceId: string) => {
        const WINDOW_ID = "menubar-window";
        addWindow({
            id: WINDOW_ID,
            className: "province-window",
            left: 125,
            top: 60,
            width: 360,
            height: 400,
            content: <ProvinceWindow windowId={WINDOW_ID} provinceId={provinceId}/>,
        });
    };
}


export interface ProvinceWindowProps {
    windowId: string;
    provinceId: string,
}


interface ProvinceWindowData {
    provinceId: string,
    provinceName: string,
    countryId: string,
    countryName: string,
    cities: CityData[]
}

interface CityData {
    cityId: string,
    cityName: string
    isCountryCapitol: boolean,
    isProvinceCapitol: boolean,
}

export function ProvinceWindow(props: ProvinceWindowProps): ReactElement {

    const data: ProvinceWindowData = MockData.getProvinceData(props.provinceId) as ProvinceWindowData;

    const openCountryWindow = useOpenCountryWindow();
    const openCityWindow = useOpenCityWindow();

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
                    <Header1 centered>{data.provinceName}</Header1>
                </Banner>

                <VBox className="window-content" scrollable fillParent gap_s stableScrollbar top stretch padding_m>

                    <InsetPanel>
                        <KeyTextValuePair name={"Id"} value={data.provinceId}/>
                        <KeyLinkValuePair name={"Country"} value={data.countryName} onClick={() => openCountryWindow(data.countryId, true)}/>
                    </InsetPanel>

                    <Spacer size="m"/>
                    <Header2 centered>Cities</Header2>
                    <Divider/>

                    <InsetPanel>
                        <VBox fillParent gap_s top stretch>
                            {data.cities.map(city => <City key={city.cityId} data={city} onOpen={() => openCityWindow(city.cityId)}/>)}
                        </VBox>
                    </InsetPanel>

                </VBox>

            </VBox>

        </DecoratedWindow>
    );

}


function City(props: { data: CityData, onOpen: () => void }) {
    return (
        <DecoratedPanel paddingSmall blue simpleBorder>
            <HBox centerVertical gap_s>
                <LinkButton onClick={props.onOpen}>{props.data.cityName}</LinkButton>
                {props.data.isCountryCapitol && <RiVipCrown2Fill/>}
                {props.data.isProvinceCapitol && <RiVipCrown2Line/>}
            </HBox>
        </DecoratedPanel>
    );
}