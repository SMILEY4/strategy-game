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
import {KeyTextValuePair, KeyValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {ProvinceEntry} from "../common/ProvinceEntry";
import {CityEntry} from "../common/CityEntry";
import {CountryIdentifier, CountryView} from "../../../../../models/country";
import {CountryRepository} from "../../../../../state/access/CountryRepository";
import {AppCtx} from "../../../../../appContext";
import {Text} from "../../../../components/text/Text";
import {ChangeInfoText} from "../../../../components/info/ChangeInfoText";
import {InfoVisibility} from "../../../../../models/infoVisibility";
import {CommandRepository} from "../../../../../state/access/CommandRepository";


export function useOpenCountryWindow() {
    const addWindow = useOpenWindow();
    return (countryId: string, keepPosition: boolean) => {
        const WINDOW_ID = "menubar-window";
        addWindow({
            id: WINDOW_ID,
            className: "country-window",
            left: 25,
            top: 60,
            bottom: 25,
            width: 360,
            content: <CountryWindow windowId={WINDOW_ID} countryId={countryId}/>,
        }, keepPosition);
    };
}


export interface CountryWindowProps {
    windowId: string;
    countryId: string,
}

export function CountryWindow(props: CountryWindowProps): ReactElement {
    const country = CountryRepository.useCountryById(props.countryId);
    const countryView = AppCtx.DataViewService().getCountryView(country);
    const commands = CommandRepository.useCommands() // so menu updates with changes to commands

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
                    <CountryBaseInformation data={countryView}/>
                    <Spacer size="m"/>
                    <CountryProvincesAndCities
                        data={countryView}
                        openProvinceWindow={(id) => openProvinceWindow(id, true)}
                        openCityWindow={(id) => openCityWindow(id, true)}
                    />
                </VBox>
            </VBox>
        </DecoratedWindow>
    );

}


function CountryBanner(props: { identifier: CountryIdentifier }): ReactElement {
    return (
        <Banner spaceAbove subtitle={"Country"}>
            <Header1 centered>{props.identifier.name}</Header1>
        </Banner>
    );
}

function CountryBaseInformation(props: { data: CountryView }): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair name={"Id"} value={props.data.identifier.id}/>
            <KeyTextValuePair name={"Player"} value={props.data.player.name}/>
            <KeyValuePair name={"Settlers"}>
                {props.data.settlers.visibility === InfoVisibility.KNOWN && (
                    <ChangeInfoText prevValue={props.data.settlers.value} nextValue={props.data.settlers.modifiedValue}/>
                )}
                {props.data.settlers.visibility === InfoVisibility.UNKNOWN && (
                    <Text>?</Text>
                )}
            </KeyValuePair>
        </InsetPanel>
    );
}


function CountryProvincesAndCities(props: {
    data: CountryView,
    openProvinceWindow: (id: string) => void,
    openCityWindow: (id: string) => void,
}): ReactElement {
    return (
        <>
            <Header2 centered>
                {props.data.provinces.visibility === InfoVisibility.KNOWN
                    ? "Provinces & Cities"
                    : "Known Provinces & Cities"}
            </Header2>
            <Divider/>

            <InsetPanel>
                <VBox fillParent gap_s top stretch>
                    {props.data.provinces.items.map(province => (
                        <ProvinceEntry
                            key={province.identifier.id}
                            data={province}
                            onOpenProvince={() => props.openProvinceWindow(province.identifier.id)}
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

