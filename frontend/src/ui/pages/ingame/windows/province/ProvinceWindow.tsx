import React, {ReactElement} from "react";
import {DefaultDecoratedWindowWithBanner} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {CityListEntry} from "../common/CityListEntry";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ResourceBalanceBox} from "../common/ResourceBalanceBox";
import {InfoVisibility} from "../../../../../models/infoVisibility";
import {UseProvinceWindow} from "./useProvinceWindow";
import {KeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {WindowSection} from "../../../../components/section/ContentSection";


export interface ProvinceWindowProps {
    windowId: string;
    provinceId: string,
}

export function ProvinceWindow(props: ProvinceWindowProps): ReactElement {

    const data: UseProvinceWindow.Data = UseProvinceWindow.useData(props.provinceId);

    return (
        <DefaultDecoratedWindowWithBanner windowId={props.windowId} title={data.province.identifier.name} subtitle="Province">
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
                    <EnrichedText>{props.province.identifier.id}</EnrichedText>

                    <EnrichedText>Country:</EnrichedText>
                    <EnrichedText><ETLink onClick={props.openWindow.country}>{props.province.country.name}</ETLink></EnrichedText>

                </KeyValueGrid>
            </InsetPanel>
        </WindowSection>
    );
}

function ProvinceResourceBalanceSection(props: UseProvinceWindow.Data): ReactElement {
    return (
        <WindowSection
            title={props.province.resourceLedger.visibility === InfoVisibility.KNOWN ? "Resource Balance" : "Known Resource Balance"}
        >
            <InsetPanel>

                <HBox fillParent gap_s top left wrap>
                    {Array.from(props.province.resourceLedger.ledger.entries).map(entry => (
                        <ResourceBalanceBox
                            key={entry.resourceType.id}
                            data={entry}
                        />
                    ))}
                </HBox>

            </InsetPanel>
        </WindowSection>
    );
}

function CitiesSection(props: UseProvinceWindow.Data): ReactElement {
    return (
        <WindowSection title={props.province.cities.visibility === InfoVisibility.KNOWN ? "Cities" : "Known Cities"}>
            <InsetPanel>
                <VBox fillParent gap_s top stretch>
                    {props.province.cities.items.map(city => {
                        return (
                            <CityListEntry
                                key={city.identifier.id}
                                data={city}
                                onOpen={() => props.openWindow.city(city)}
                            />
                        );
                    })}
                </VBox>
            </InsetPanel>
        </WindowSection>
    );
}
