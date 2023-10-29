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
import {CityEntry} from "../common/CityEntry";
import {Province, ProvinceIdentifier, ProvinceView} from "../../../../../models/province";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ResourceBalanceBox} from "../common/ResourceBalanceBox";
import {ProvinceRepository} from "../../../../../state/access/ProvinceRepository";
import {AppCtx} from "../../../../../appContext";
import {InfoVisibility} from "../../../../../models/infoVisibility";
import {CommandRepository} from "../../../../../state/access/CommandRepository";


export function useOpenProvinceWindow() {
    const addWindow = useOpenWindow();
    return (provinceId: string, keepPosition: boolean) => {
        const WINDOW_ID = "menubar-window";
        addWindow({
            id: WINDOW_ID,
            className: "province-window",
            left: 25,
            top: 60,
            bottom: 25,
            width: 360,
            content: <ProvinceWindow windowId={WINDOW_ID} provinceId={provinceId}/>,
        }, keepPosition);
    };
}


export interface ProvinceWindowProps {
    windowId: string;
    provinceId: string,
}

export function ProvinceWindow(props: ProvinceWindowProps): ReactElement {

    const province = ProvinceRepository.useProvinceById(props.provinceId);
    const provinceView = AppCtx.DataViewService().getProvinceView(province)
    const commands = CommandRepository.useCommands() // so menu updates with changes to commands

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
                    <ProvinceBaseInformationSection
                        data={provinceView}
                        openCountry={() => openCountryWindow(province.country.id, true)}
                    />
                    <Spacer size="m"/>
                    <ProvinceResourceBalanceSection data={provinceView}/>
                    <Spacer size="m"/>
                    <ProvinceCitiesSection
                        data={provinceView}
                        openCity={(id) => openCityWindow(id, true)}
                    />
                </VBox>
            </VBox>
        </DecoratedWindow>
    );

}


function ProvinceBanner(props: { identifier: ProvinceIdentifier }): ReactElement {
    return (
        <Banner spaceAbove subtitle={"Province"}>
            <Header1 centered>{props.identifier.name}</Header1>
        </Banner>
    );
}

function ProvinceBaseInformationSection(props: { data: ProvinceView, openCountry: () => void }): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair name={"Id"} value={props.data.identifier.id}/>
            <KeyLinkValuePair name={"Country"} value={props.data.country.name} onClick={props.openCountry}/>
        </InsetPanel>
    );
}

function ProvinceResourceBalanceSection(props: { data: ProvinceView }): ReactElement {
    return (
        <>
            <Header2 centered>
                {props.data.resourceBalance.visibility === InfoVisibility.KNOWN
                    ? "Resource Balance"
                    : "Known Resource Balance"}
            </Header2>
            <Divider/>

            <InsetPanel>

                <HBox fillParent gap_s top left wrap>
                    {Array.from(props.data.resourceBalance.items).map(entry => (
                        <ResourceBalanceBox data={{
                            type: entry[0],
                            value: entry[1],
                            contributions: [],
                        }}/>
                    ))}
                </HBox>

            </InsetPanel>
        </>
    );
}

function ProvinceCitiesSection(props: { data: ProvinceView, openCity: (id: string) => void }): ReactElement {
    return (
        <>

            <Header2 centered>
                {props.data.cities.visibility === InfoVisibility.KNOWN
                    ? "Cities"
                    : "Known Cities"}
            </Header2>
            <Divider/>

            <InsetPanel>
                <VBox fillParent gap_s top stretch>
                    {props.data.cities.items.map(city => {
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
