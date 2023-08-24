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
import {MockData} from "../../mockData";
import {useOpenCountryWindow} from "../country/CountryWindow";
import {KeyLinkValuePair, KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import "./cityMenu.less";
import {joinClassNames} from "../../../../components/utils";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {CgClose, FiPlus} from "react-icons/all";

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

interface CityWindowData {
    cityId: string,
    cityName: string
    isCountryCapitol: boolean,
    isProvinceCapitol: boolean,
    provinceId: string,
    provinceName: string,
    countryId: string,
    countryName: string,
    resources: ({
        icon: string,
        value: number,
    })[]
}


export function CityWindow(props: CountryWindowProps): ReactElement {

    const data: CityWindowData = MockData.getCityData(props.cityId) as CityWindowData;

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

                <Banner spaceAbove>
                    <Header1 centered>{data.cityName}</Header1>
                </Banner>

                <VBox className="window-content" scrollable fillParent gap_s stableScrollbar top stretch padding_m>

                    <InsetPanel>
                        <KeyTextValuePair name={"Id"} value={data.cityId}/>
                        <KeyLinkValuePair name={"Country"} value={data.countryName}
                                          onClick={() => openCountryWindow(data.countryId, true)}/>
                        <KeyLinkValuePair name={"Province"} value={data.provinceName}
                                          onClick={() => openProvinceWindow(data.provinceId)}/>
                    </InsetPanel>


                    <Spacer size="m"/>
                    <Header2 centered>Population</Header2>
                    <Divider/>

                    <InsetPanel>
                        <KeyTextValuePair name={"Size"} value={"3"}/>
                        <KeyTextValuePair name={"Growth Progress"} value={"+40%"}/>
                    </InsetPanel>


                    <Spacer size="m"/>
                    <Header2 centered>Resources</Header2>
                    <Divider/>

                    <HBox gap_s top left wrap>
                        {data.resources.map(resource => (
                            <ResourceBox
                                key={resource.icon}
                                icon={resource.icon}
                                value={resource.value}
                            />
                        ))}
                    </HBox>

                    <Spacer size="m"/>
                    <Header2 centered>Contents</Header2>
                    <Divider/>

                    <HBox centerVertical left gap_s>
                        <ButtonPrimary square>
                            <FiPlus/>
                        </ButtonPrimary>
                        <HBox gap_xs spaceBetween centerVertical className="production_queue__progress">
                            <div
                                className="production_queue__progress-bar"
                                style={{right: (100 - 50) + "%",}}
                            />
                            <Text>Farm</Text>
                            <Text>70%</Text>
                        </HBox>
                        <ButtonPrimary square round small>
                            <CgClose/>
                        </ButtonPrimary>
                    </HBox>

                    <Spacer size={"xs"}/>

                    <HBox gap_s centerVertical left>
                        <Text>Buildings: 3/4</Text>
                    </HBox>

                    <HBox gap_s top left wrap>
                        <ContentBox iconFilename="Woodcutter.png"/>
                        <ContentBox iconFilename="farm.png"/>
                        <ContentBox iconFilename="farm.png"/>
                        <ContentBox iconFilename="Woodcutter.png"/>
                        <ContentBox iconFilename="Woodcutter.png"/>
                        <ContentBox iconFilename="farm.png"/>
                        <ContentBox iconFilename="Woodcutter.png"/>
                        <ContentBox iconFilename="farm.png"/>
                        <ContentBox iconFilename="farm.png"/>
                    </HBox>


                </VBox>

            </VBox>

        </DecoratedWindow>
    );

}


function ResourceBox(props: { icon: string, value: number }) {
    return (
        <InsetPanel className="resource-box">
            <div
                className="resource-box__icon"
                style={{backgroundImage: "url('" + props.icon + "')"}}
            />
            <Text
                className={joinClassNames([
                    "resource-box__text",
                    "resource-box__text--" + getValueType(props.value),
                ])}
            >
                {formatValue(props.value)}
            </Text>
        </InsetPanel>
    );

    function formatValue(value: number): string {
        const simpleValue = Math.round(value * 100) / 100;
        if (simpleValue < 0) {
            return "" + simpleValue;
        }
        if (simpleValue > 0) {
            return "+" + simpleValue;
        }
        return "0";
    }

    function getValueType(value: number): "positive" | "negative" | "neutral" {
        if (value > 0) {
            return "positive";
        }
        if (value < 0) {
            return "negative";
        }
        return "neutral";
    }

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