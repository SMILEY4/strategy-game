import React, {ReactElement} from "react";
import {DefaultDecoratedWindowWithBanner} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {CityListEntry} from "../common/CityListEntry";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ResourceBalanceBox} from "../common/ResourceBalanceBox";
import {UseProvinceWindow} from "./useProvinceWindow";
import {KeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {WindowSection} from "../../../../components/section/ContentSection";
import {Else, If, Then} from "react-if";


export interface ProvinceWindowProps {
    windowId: string;
    provinceId: string,
}

export function ProvinceWindow(props: ProvinceWindowProps): ReactElement {

    const data: UseProvinceWindow.Data = UseProvinceWindow.useData(props.provinceId);

    return (
        <DefaultDecoratedWindowWithBanner
            windowId={props.windowId}
            title={data.province.base.identifier.name}
            subtitle="Province"
        >
            <BaseDataSection {...data}/>
            <Spacer size="m"/>
            <ProvinceResourceBalanceSection {...data}/>
            <Spacer size="m"/>
            <CitiesSection {...data}/>
        </DefaultDecoratedWindowWithBanner>
    );
}

function BaseDataSection(props: UseProvinceWindow.Data): ReactElement {
    return (
        <WindowSection>
            <InsetPanel>
                <KeyValueGrid>

                    <EnrichedText>Id:</EnrichedText>
                    <EnrichedText>{props.province.base.identifier.id}</EnrichedText>

                    <EnrichedText>Country:</EnrichedText>
                    <EnrichedText><ETLink onClick={props.openWindow.country}>{props.province.base.country.name}</ETLink></EnrichedText>

                </KeyValueGrid>
            </InsetPanel>
        </WindowSection>
    );
}

function ProvinceResourceBalanceSection(props: UseProvinceWindow.Data): ReactElement {
    return (
        <WindowSection title="Resource Balance">
            <InsetPanel>
                <If condition={props.province.base.resourceLedger.visible}>
                    <Then>
                        <HBox fillParent gap_s top left wrap>
                            {Array.from(props.province.base.resourceLedger.value.entries).map(entry => (
                                <ResourceBalanceBox
                                    key={entry.resourceType.id}
                                    data={entry}
                                />
                            ))}
                        </HBox>
                    </Then>
                    <Else>
                        <EnrichedText>Unknown</EnrichedText>
                    </Else>
                </If>
            </InsetPanel>
        </WindowSection>
    );
}

function CitiesSection(props: UseProvinceWindow.Data): ReactElement {
    return (
        <WindowSection title="Cities">
            <InsetPanel>
                <VBox fillParent gap_s top stretch>
                    {props.province.base.cities.map(city => (
                        <CityListEntry
                            key={city.identifier.id}
                            data={city}
                            onOpen={() => props.openWindow.city(city)}
                        />
                    ))}
                    {props.province.modified.createdCities.map(city => (
                        <CityListEntry
                            key={city.identifier.id}
                            data={city}
                            onOpen={() => props.openWindow.city(city)}
                        />
                    ))}
                </VBox>
            </InsetPanel>
        </WindowSection>
    );
}
