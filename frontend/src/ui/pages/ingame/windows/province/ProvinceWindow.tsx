import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import {useOpenCountryWindow} from "../country/CountryWindow";
import {useOpenCityWindow} from "../city/CityMenu";
import {KeyLinkValuePair, KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {ProvinceData} from "../../../../models/province/provinceData";
import {ProvinceIdentifier} from "../../../../models/province/provinceIdentifier";
import {CityEntry} from "../common/CityEntry";
import {MockData} from "../../mockData";
import {useProvince} from "../../../../hooks/province";


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

export function ProvinceWindow(props: ProvinceWindowProps): ReactElement {

    const province = useProvince(props.provinceId)
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
                <ProvinceBanner identifier={province.identifier}/>
                <VBox className="window-content" scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                    <ProvinceBaseInformation
                        data={province}
                        openCountry={() => openCountryWindow(province.country.id, true)}
                    />
                    <ProvinceCities
                        data={province}
                        openCity={openCityWindow}
                    />
                </VBox>
            </VBox>
        </DecoratedWindow>
    );

}


function ProvinceBanner(props: { identifier: ProvinceIdentifier }): ReactElement {
    return (
        <Banner spaceAbove>
            <Header1 centered>{props.identifier.name}</Header1>
        </Banner>
    );
}

function ProvinceBaseInformation(props: { data: ProvinceData, openCountry: () => void }): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair name={"Id"} value={props.data.identifier.name}/>
            <KeyLinkValuePair name={"Country"} value={props.data.country.name} onClick={props.openCountry}/>
        </InsetPanel>
    );
}

function ProvinceCities(props: { data: ProvinceData, openCity: (id: string) => void }): ReactElement {
    return (
        <>
            <Spacer size="m"/>
            <Header2 centered>Cities</Header2>
            <Divider/>

            <InsetPanel>
                <VBox fillParent gap_s top stretch>
                    {props.data.cities.map(city => {
                        return (
                            <CityEntry
                                data={city}
                                onOpen={() => props.openCity(city.identifier.id)}
                            />
                        );
                    })}
                </VBox>
            </InsetPanel>
        </>
    );
}
