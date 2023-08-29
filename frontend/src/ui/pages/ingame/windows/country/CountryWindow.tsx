import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import {useOpenProvinceWindow} from "../province/ProvinceWindow";
import {useOpenCityWindow} from "../city/CityMenu";
import {KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {CountryData} from "../../../../models/country/countryData";
import {CountryIdentifier} from "../../../../models/country/countryIdentifier";
import {ProvinceEntry} from "../common/ProvinceEntry";
import {CityEntry} from "../common/CityEntry";
import {useCountry} from "../../../../hooks/country";


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


export interface CountryWindowProps {
    windowId: string;
    countryId: string,
}

export function CountryWindow(props: CountryWindowProps): ReactElement {

    const country = useCountry(props.countryId);
    const openProvinceWindow = useOpenProvinceWindow();
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
                <CountryBanner identifier={country.identifier}/>
                <VBox className="window-content" scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                    <CountryBaseInformation data={country}/>
                    <CountryProvincesAndCities
                        data={country}
                        openProvinceWindow={openProvinceWindow}
                        openCityWindow={openCityWindow}
                    />
                </VBox>
            </VBox>
        </DecoratedWindow>
    );

}


function CountryBanner(props: { identifier: CountryIdentifier }): ReactElement {
    return (
        <Banner spaceAbove>
            <Header1 centered>{props.identifier.name}</Header1>
        </Banner>
    );
}

function CountryBaseInformation(props: { data: CountryData }): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair name={"Id"} value={props.data.identifier.id}/>
            <KeyTextValuePair name={"Player"} value={props.data.playerName}/>
            <KeyTextValuePair name={"Settlers"} value={props.data.settlers}/>
        </InsetPanel>
    );
}


function CountryProvincesAndCities(props: {
    data: CountryData,
    openProvinceWindow: (id: string) => void,
    openCityWindow: (id: string) => void,
}): ReactElement {
    return (
        <>
            <Spacer size="m"/>
            <Header2 centered>Provinces & Cities</Header2>
            <Divider/>

            <InsetPanel>
                <VBox fillParent gap_s top stretch>
                    {props.data.provinces.map(province => (
                        <ProvinceEntry
                            key={province.identifier.id}
                            data={province}
                            onOpenProvince={() => props.openProvinceWindow(province.identifier.id)}
                            onOpenCity={cityId => props.openCityWindow(cityId)}
                        >
                            {province.cities.map(city => (
                                <CityEntry
                                    key={city.identifier.id}
                                    data={city}
                                    onOpen={() => props.openCityWindow(city.identifier.id)}
                                />
                            ))}
                        </ProvinceEntry>
                    ))}
                </VBox>
            </InsetPanel>
        </>
    );
}

