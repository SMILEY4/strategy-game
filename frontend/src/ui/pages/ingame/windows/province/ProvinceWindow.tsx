import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import {KeyLinkValuePair, KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {CityListEntry} from "../common/CityListEntry";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ResourceBalanceBox} from "../common/ResourceBalanceBox";
import {InfoVisibility} from "../../../../../models/infoVisibility";
import {UseProvinceWindow} from "./useProvinceWindow";


export interface ProvinceWindowProps {
    windowId: string;
    provinceId: string,
}

export function ProvinceWindow(props: ProvinceWindowProps): ReactElement {

    const data: UseProvinceWindow.Data = UseProvinceWindow.useData(props.provinceId);

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
                <ProvinceBanner {...data}/>
                <VBox className="window-content" scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                    <BaseInformation {...data}/>
                    <Spacer size="m"/>
                    <ProvinceResourceBalanceSection {...data}/>
                    <Spacer size="m"/>
                    <CitiesSection {...data}/>
                </VBox>
            </VBox>
        </DecoratedWindow>
    );
}


function ProvinceBanner(props: UseProvinceWindow.Data): ReactElement {
    return (
        <Banner spaceAbove subtitle={"Province"}>
            <Header1 centered>{props.province.identifier.name}</Header1>
        </Banner>
    );
}

function BaseInformation(props: UseProvinceWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair name={"Id"} value={props.province.identifier.id}/>
            <KeyLinkValuePair name={"Country"} value={props.province.country.name} onClick={props.openWindow.country}/>
        </InsetPanel>
    );
}

function ProvinceResourceBalanceSection(props: UseProvinceWindow.Data): ReactElement {
    return (
        <>
            <Header2 centered>
                {props.province.resourceBalance.visibility === InfoVisibility.KNOWN
                    ? "Resource Balance"
                    : "Known Resource Balance"}
            </Header2>
            <Divider/>

            <InsetPanel>

                <HBox fillParent gap_s top left wrap>
                    {Array.from(props.province.resourceBalance.items).map(entry => (
                        <ResourceBalanceBox
                            key={entry[0].id}
                            data={{
                                type: entry[0],
                                value: entry[1],
                                contributions: [],
                            }}
                        />
                    ))}
                </HBox>

            </InsetPanel>
        </>
    );
}

function CitiesSection(props: UseProvinceWindow.Data): ReactElement {
    return (
        <>

            <Header2 centered>
                {props.province.cities.visibility === InfoVisibility.KNOWN
                    ? "Cities"
                    : "Known Cities"}
            </Header2>

            <Divider/>

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
        </>
    );
}
