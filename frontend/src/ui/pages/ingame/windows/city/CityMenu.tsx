import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {useOpenProvinceWindow} from "../province/ProvinceWindow";
import {useOpenCountryWindow} from "../country/CountryWindow";
import {KeyLinkValuePair, KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {CgClose, FiPlus} from "react-icons/all";
import {CityIdentifier} from "../../../../models/city/cityIdentifier";
import {CityData} from "../../../../models/city/cityData";
import {formatPercentage} from "../../../../components/utils";
import {ResourceBalanceBox} from "../common/ResourceBalanceBox";
import {ProductionQueueEntry} from "../../../../models/city/productionQueueEntry";
import "./cityMenu.less";
import {MockData} from "../../mockData";

export function useOpenCityWindow() {
    const addWindow = useOpenWindow();
    return (cityId: string) => {
        const WINDOW_ID = "menubar-window";
        addWindow({
            id: WINDOW_ID,
            className: "city-window",
            left: 125,
            top: 60,
            width: 360,
            height: 400,
            content: <CityWindow windowId={WINDOW_ID} cityId={cityId}/>,
        });
    };
}


export interface CountryWindowProps {
    windowId: string;
    cityId: string,
}


export function CityWindow(props: CountryWindowProps): ReactElement {

    const data = MockData.getCityData(props.cityId);

    const openCountryWindow = useOpenCountryWindow();
    const openProvinceWindow = useOpenProvinceWindow();

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
                <CityBanner identifier={data.identifier}/>
                <VBox className="window-content" scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                    <CityBaseDataSection
                        data={data}
                        openCountry={() => openCountryWindow(data.country.id, true)}
                        openProvince={() => openProvinceWindow(data.province.id)}
                    />
                    <CityPopulationSection data={data}/>
                    <CityResourceSection data={data}/>
                    <CityContentSection data={data}/>
                </VBox>
            </VBox>
        </DecoratedWindow>
    );
}


function CityBanner(props: { identifier: CityIdentifier }): ReactElement {
    return (
        <Banner spaceAbove>
            <Header1 centered>{props.identifier.name}</Header1>
        </Banner>
    );
}

function CityBaseDataSection(props: {
    data: CityData,
    openCountry: () => void,
    openProvince: () => void
}): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair
                name={"Id"}
                value={props.data.identifier.id}
            />
            <KeyLinkValuePair
                name={"Country"}
                value={props.data.country.name}
                onClick={props.openCountry}
            />
            <KeyLinkValuePair
                name={"Province"}
                value={props.data.province.name}
                onClick={props.openProvince}
            />
        </InsetPanel>
    );
}


function CityPopulationSection(props: { data: CityData }): ReactElement {
    return (
        <>
            <Spacer size="m"/>
            <Header2 centered>Population</Header2>
            <Divider/>
            <InsetPanel>
                <KeyTextValuePair
                    name={"Size"}
                    value={props.data.population.size}
                />
                <KeyTextValuePair
                    name={"Growth Progress"}
                    value={formatPercentage(props.data.population.progress, true)}
                />
            </InsetPanel>
        </>
    );
}


function CityResourceSection(props: { data: CityData }): ReactElement {
    return (
        <>
            <Spacer size="m"/>
            <Header2 centered>Resources</Header2>
            <Divider/>

            <HBox gap_s top left wrap>
                {props.data.resources.map(resource => (
                    <ResourceBalanceBox data={resource}/>
                ))}
            </HBox>
        </>
    );
}


function CityContentSection(props: { data: CityData }): ReactElement {
    return (
        <>
            <Spacer size="m"/>
            <Header2 centered>Contents</Header2>
            <Divider/>

            <CityProductionQueue data={props.data}/>

            <Spacer size={"xs"}/>

            <CityContentList data={props.data}/>
        </>
    );
}


function CityProductionQueue(props: { data: CityData }): ReactElement {
    const entry: ProductionQueueEntry = props.data.productionQueue.length === 0
        ? {name: "-", progress: 0}
        : props.data.productionQueue[0];

    return (
        <HBox centerVertical left gap_s>
            <ButtonPrimary square>
                <FiPlus/>
            </ButtonPrimary>
            <HBox gap_xs spaceBetween centerVertical className="production_queue__progress">
                <div
                    className="production_queue__progress-bar"
                    style={{right: (100 - entry.progress * 100) + "%"}}
                />
                <Text>{entry.name}</Text>
                <Text>{formatPercentage(entry.progress, false)}</Text>
            </HBox>
            <ButtonPrimary square round small>
                <CgClose/>
            </ButtonPrimary>
        </HBox>
    );
}

function CityContentList(props: { data: CityData }): ReactElement {
    return (
        <>
            <HBox gap_s centerVertical left>
                <Text>{"Slots: " + props.data.content.length + "/" + props.data.maxContentSlots}</Text>
            </HBox>

            <HBox gap_s top left wrap>
                {props.data.content.map(content => (
                    <ContentBox iconFilename={content.icon}/>
                ))}
            </HBox>
        </>
    );
}

function ContentBox(props: { iconFilename: string }) {
    return (
        <div
            className="city-content-box"
            style={{
                backgroundImage: "url('/icons/buildings/" + props.iconFilename + "')",
            }}
        />
    );
}
