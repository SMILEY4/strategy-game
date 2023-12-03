import React, {ReactElement} from "react";
import {DefaultDecoratedWindowWithBanner} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {ProvinceListEntry} from "../common/ProvinceListEntry";
import {CityListEntry} from "../common/CityListEntry";
import {InfoVisibility} from "../../../../../models/infoVisibility";
import {UseCountryWindow} from "./useCountryWindow";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ChangeInfoText} from "../../../../components/info/ChangeInfoText";
import {Else, If, Then} from "react-if";
import {WindowSection} from "../../../../components/section/ContentSection";

export interface CountryWindowProps {
    windowId: string;
    countryId: string,
}

export function CountryWindow(props: CountryWindowProps): ReactElement {

    const data: UseCountryWindow.Data = UseCountryWindow.useData(props.countryId);

    return (
        <DefaultDecoratedWindowWithBanner windowId={props.windowId} title={data.country.identifier.name} subtitle="Country">
            <BaseDataSection {...data}/>
            <Spacer size="m"/>
            <ProvincesAndCitiesSection {...data}/>
        </DefaultDecoratedWindowWithBanner>
    );

}


function BaseDataSection(props: UseCountryWindow.Data): ReactElement {
    return (
        <WindowSection>
            <InsetKeyValueGrid>

                <EnrichedText>Id:</EnrichedText>
                <EnrichedText>{props.country.identifier.id}</EnrichedText>

                <EnrichedText>Player:</EnrichedText>
                <EnrichedText>{props.country.player.name}</EnrichedText>

                <If condition={props.country.settlers.visibility === InfoVisibility.KNOWN}>
                    <Then>
                        <EnrichedText>Settlers:</EnrichedText>
                        <ChangeInfoText prevValue={props.country.settlers.value} nextValue={props.country.settlers.modifiedValue}/>
                    </Then>
                    <Else>
                        <EnrichedText>Settlers:</EnrichedText>
                        <EnrichedText>?</EnrichedText>
                    </Else>
                </If>

            </InsetKeyValueGrid>
        </WindowSection>
    );
}


function ProvincesAndCitiesSection(props: UseCountryWindow.Data): ReactElement {
    return (
        <WindowSection
            title={props.country.provinces.visibility === InfoVisibility.KNOWN ? "Provinces & Cities" : "Known Provinces & Cities"}
        >
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
        </WindowSection>
    );
}

