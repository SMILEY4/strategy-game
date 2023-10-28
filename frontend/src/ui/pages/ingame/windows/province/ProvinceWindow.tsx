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
import {Province, ProvinceIdentifier} from "../../../../../models/province";
import {GameStateAccess} from "../../../../../state/access/GameStateAccess";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ResourceBalanceBox} from "../common/ResourceBalanceBox";


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

    const province = GameStateAccess.useProvinceById(props.provinceId);
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
                        data={province}
                        openCountry={() => openCountryWindow(province.country.id, true)}
                    />
                    <Spacer size="m"/>
                    <ProvinceResourceBalanceSection data={province}/>
                    <Spacer size="m"/>
                    <ProvinceCitiesSection
                        data={province}
                        openCity={(id) => openCityWindow(id, true)}
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

function ProvinceBaseInformationSection(props: { data: Province, openCountry: () => void }): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair name={"Id"} value={props.data.identifier.id}/>
            <KeyLinkValuePair name={"Country"} value={props.data.country.name} onClick={props.openCountry}/>
        </InsetPanel>
    );
}

function ProvinceResourceBalanceSection(props: { data: Province }): ReactElement {
    console.log("RENDER PROVINCE RESOURCES", props.data)
    return (
        <>
            <Header2 centered>Resource Balance</Header2>
            <Divider/>

            <InsetPanel>

                <HBox fillParent gap_s top left wrap>
                    {Array.from(props.data.resourceBalance).map(entry => (
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

function ProvinceCitiesSection(props: { data: Province, openCity: (id: string) => void }): ReactElement {
    return (
        <>
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
