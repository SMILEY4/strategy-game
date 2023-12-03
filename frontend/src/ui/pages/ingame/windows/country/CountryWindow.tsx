import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import {ProvinceListEntry} from "../common/ProvinceListEntry";
import {CityListEntry} from "../common/CityListEntry";
import {InfoVisibility} from "../../../../../models/infoVisibility";
import {UseCountryWindow} from "./useCountryWindow";
import {KeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {If} from "../../../../components/if/If";
import {ChangeInfoText} from "../../../../components/info/ChangeInfoText";

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
            <KeyValueGrid>

                <EnrichedText>Id:</EnrichedText>
                <EnrichedText>{props.country.identifier.id}</EnrichedText>

                <EnrichedText>Player:</EnrichedText>
                <EnrichedText>{props.country.player.name}</EnrichedText>

                <If condition={props.country.settlers.visibility === InfoVisibility.KNOWN}>
                    <EnrichedText>Settlers:</EnrichedText>
                    <ChangeInfoText prevValue={props.country.settlers.value} nextValue={props.country.settlers.modifiedValue}/>
                </If>
                <If condition={props.country.settlers.visibility === InfoVisibility.UNKNOWN}>
                    <EnrichedText>Settlers:</EnrichedText>
                    <EnrichedText>?</EnrichedText>
                </If>

            </KeyValueGrid>

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
                        <ProvinceListEntry
                            key={province.identifier.id}
                            data={province}
                            onOpenProvince={() => props.openWindow.province(province)}
                        >
                            {province.cities.map(city => (
                                <CityListEntry
                                    key={city.identifier.id}
                                    data={city}
                                    onOpen={() => props.openWindow.city(city)}
                                />
                            ))}
                        </ProvinceListEntry>
                    ))}
                </VBox>
            </InsetPanel>
        </>
    );
}

