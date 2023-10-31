import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import {KeyTextValuePair, KeyValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {ProvinceEntry} from "../common/ProvinceEntry";
import {CityEntry} from "../common/CityEntry";
import {Text} from "../../../../components/text/Text";
import {ChangeInfoText} from "../../../../components/info/ChangeInfoText";
import {InfoVisibility} from "../../../../../models/infoVisibility";
import {UseCountryWindow} from "./useCountryWindow";

export interface CountryWindowProps {
    windowId: string;
    countryId: string,
}

export function CountryWindow(props: CountryWindowProps): ReactElement {

    const data: UseCountryWindow.Data = UseCountryWindow.useData(props.countryId);

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
                <CountryBanner {...data}/>
                <VBox className="window-content" scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                    <BaseInformation {...data}/>
                    <Spacer size="m"/>
                    <ProvincesAndCities {...data}/>
                </VBox>
            </VBox>
        </DecoratedWindow>
    );

}


function CountryBanner(props: UseCountryWindow.Data): ReactElement {
    return (
        <Banner spaceAbove subtitle={"Country"}>
            <Header1 centered>{props.country.identifier.name}</Header1>
        </Banner>
    );
}

function BaseInformation(props: UseCountryWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair name={"Id"} value={props.country.identifier.id}/>
            <KeyTextValuePair name={"Player"} value={props.country.player.name}/>
            <KeyValuePair name={"Settlers"}>
                {props.country.settlers.visibility === InfoVisibility.KNOWN && (
                    <ChangeInfoText prevValue={props.country.settlers.value} nextValue={props.country.settlers.modifiedValue}/>
                )}
                {props.country.settlers.visibility === InfoVisibility.UNKNOWN && (
                    <Text>?</Text>
                )}
            </KeyValuePair>
        </InsetPanel>
    );
}


function ProvincesAndCities(props: UseCountryWindow.Data): ReactElement {
    return (
        <>
            <Header2 centered>
                {props.country.provinces.visibility === InfoVisibility.KNOWN
                    ? "Provinces & Cities"
                    : "Known Provinces & Cities"}
            </Header2>
            <Divider/>

            <InsetPanel>
                <VBox fillParent gap_s top stretch>
                    {props.country.provinces.items.map(province => (
                        <ProvinceEntry
                            key={province.identifier.id}
                            data={province}
                            onOpenProvince={() => props.openWindow.province(province.identifier)}
                        >
                            {province.cities.map(city => (
                                <CityEntry
                                    key={city.identifier.id}
                                    data={city}
                                    onOpen={() => props.openWindow.city(city.identifier)}
                                />
                            ))}
                        </ProvinceEntry>
                    ))}
                </VBox>
            </InsetPanel>
        </>
    );
}

