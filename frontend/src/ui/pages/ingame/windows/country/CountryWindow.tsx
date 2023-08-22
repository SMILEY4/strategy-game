import React, {ReactElement, useState} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {BiChevronDown, BiChevronRight, RiVipCrown2Fill, RiVipCrown2Line} from "react-icons/all";
import {LinkButton} from "../../../../components/button/link/LinkButton";


export function useOpenCountryWindow() {
    const addWindow = useOpenWindow();
    return (countryId: string, isPlayerCountry: boolean) => {
        const WINDOW_ID = isPlayerCountry ? "menubar-window" : "country-window." + countryId;
        addWindow({
            id: WINDOW_ID,
            className: "country-window",
            left: isPlayerCountry ? 125 : 30,
            top: 60,
            width: 360,
            height: 400,
            content: <CountryWindow windowId={WINDOW_ID} countryId={countryId}/>,
        });
    };
}


export interface CountryWindowProps {
    windowId: string;
    countryId: string,
}

interface CountryWindowData {
    playerName: string,
    countryId: string,
    countryName: string,
    settlers: number | null
    provinces: ProvinceData[]
}

interface ProvinceData {
    id: string,
    name: string,
    cities: CityData[]
}

interface CityData {
    id: string,
    name: string
    isCountryCapitol: boolean,
    isProvinceCapitol: boolean,
}

export function CountryWindow(props: CountryWindowProps): ReactElement {

    const data: CountryWindowData = {
        playerName: "SMILEY_4_",
        countryId: props.countryId,
        countryName: "Deutschland",
        settlers: 3,
        provinces: [
            {
                id: "1",
                name: "Baden-Württemberg",
                cities: [
                    {
                        id: "2",
                        name: "Stuttgart",
                        isCountryCapitol: false,
                        isProvinceCapitol: true,
                    },
                    {
                        id: "3",
                        name: "Heidelberg",
                        isCountryCapitol: false,
                        isProvinceCapitol: false,
                    },
                ],
            },
            {
                id: "4",
                name: "Bayern",
                cities: [
                    {
                        id: "5",
                        name: "München",
                        isCountryCapitol: false,
                        isProvinceCapitol: true,
                    },
                    {
                        id: "6",
                        name: "Nürnberg",
                        isCountryCapitol: true,
                        isProvinceCapitol: false,

                    },
                    {
                        id: "7",
                        name: "Augsburg",
                        isCountryCapitol: false,
                        isProvinceCapitol: false,
                    },
                    {
                        id: "8",
                        name: "Würzburg",
                        isCountryCapitol: false,
                        isProvinceCapitol: false,
                    },
                ],
            },
            {
                id: "9",
                name: "Sachsen",
                cities: [
                    {
                        id: "10",
                        name: "Dresden",
                        isCountryCapitol: false,
                        isProvinceCapitol: true,
                    },
                    {
                        id: "11",
                        name: "Leipzig",
                        isCountryCapitol: false,
                        isProvinceCapitol: false,
                    },
                    {
                        id: "12",
                        name: "Chemnitz",
                        isCountryCapitol: false,
                        isProvinceCapitol: false,
                    },
                ],
            },
        ],
    };

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
                    <Header1 centered>{data.countryName}</Header1>
                </Banner>

                <VBox className="window-content" scrollable fillParent gap_s stableScrollbar top stretch padding_m>

                    <InsetPanel>
                        <HBox gap_s centerVertical>
                            <Text fillParent align="right">Id:</Text>
                            <Text fillParent align="left">{data.countryId}</Text>
                        </HBox>
                        <HBox gap_s centerVertical>
                            <Text fillParent align="right">Player:</Text>
                            <LinkButton fillParent align="left">{data.playerName}</LinkButton>
                        </HBox>
                        <HBox gap_s centerVertical>
                            <Text fillParent align="right">Settlers:</Text>
                            <Text fillParent align="left">{data.settlers}</Text>
                        </HBox>
                    </InsetPanel>

                    <Spacer size="m"/>
                    <Header2 centered>Provinces & Cities</Header2>
                    <Divider/>

                    <InsetPanel>
                        <VBox fillParent gap_s top stretch>
                            {data.provinces.map(province => <Province key={province.id} data={province}/>)}
                        </VBox>
                    </InsetPanel>

                </VBox>

            </VBox>

        </DecoratedWindow>
    );

}


function Province(props: { data: ProvinceData }) {
    const [isOpen, setOpen] = useState(false);
    return (
        <DecoratedPanel blue simpleBorder>
            <VBox gap_xs>
                <HBox centerVertical spaceBetween>
                    <LinkButton>{props.data.name}</LinkButton>
                    <ButtonPrimary small round blue onClick={() => setOpen(!isOpen)}>
                        {!isOpen && <BiChevronRight/>}
                        {isOpen && <BiChevronDown/>}
                    </ButtonPrimary>
                </HBox>
                {isOpen && <Spacer size={"xs"}/>}
                {isOpen && props.data.cities.map(city => <City key={props.data.id} data={city}/>)}
            </VBox>
        </DecoratedPanel>
    );
}


function City(props: { data: CityData }) {
    return (
        <DecoratedPanel paddingSmall blue simpleBorder>
            <HBox centerVertical gap_s>
                <LinkButton onClick={() => console.log("open", props.data.name)}>{props.data.name}</LinkButton>
                {props.data.isCountryCapitol &&  <RiVipCrown2Fill/>}
                {props.data.isProvinceCapitol &&  <RiVipCrown2Line/>}
            </HBox>
        </DecoratedPanel>
    );
}