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
import {useOpenProvinceWindow} from "../province/ProvinceWindow";
import {MockData} from "../../mockData";
import {useOpenCityWindow} from "../city/CityMenu";
import {KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";


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
    provinceId: string,
    provinceName: string,
    cities: CityData[]
}

interface CityData {
    cityId: string,
    cityName: string
    isCountryCapitol: boolean,
    isProvinceCapitol: boolean,
}

export function CountryWindow(props: CountryWindowProps): ReactElement {

    const data: CountryWindowData = MockData.getCountryData(props.countryId) as CountryWindowData;

    const openProvinceWindow = useOpenProvinceWindow();
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

                <Banner spaceAbove>
                    <Header1 centered>{data.countryName}</Header1>
                </Banner>

                <VBox className="window-content" scrollable fillParent gap_s stableScrollbar top stretch padding_m>

                    <InsetPanel>
                        <KeyTextValuePair name={"Id"} value={data.countryId}/>
                        <KeyTextValuePair name={"Player"} value={data.playerName}/>
                        <KeyTextValuePair name={"Settlers"} value={data.settlers}/>
                    </InsetPanel>

                    <Spacer size="m"/>
                    <Header2 centered>Provinces & Cities</Header2>
                    <Divider/>

                    <InsetPanel>
                        <VBox fillParent gap_s top stretch>
                            {data.provinces.map(province => <Province
                                key={province.provinceId}
                                data={province}
                                onOpenProvince={() => openProvinceWindow(province.provinceId)}
                                onOpenCity={cityId => openCityWindow(cityId)}
                            />)}
                        </VBox>
                    </InsetPanel>

                </VBox>

            </VBox>

        </DecoratedWindow>
    );

}


function Province(props: { data: ProvinceData, onOpenProvince: () => void, onOpenCity: (cityId: string) => void }) {
    const [isOpen, setOpen] = useState(false);
    return (
        <DecoratedPanel blue simpleBorder>
            <VBox gap_xs>
                <HBox centerVertical spaceBetween>
                    <LinkButton onClick={props.onOpenProvince}>{props.data.provinceName}</LinkButton>
                    <ButtonPrimary small round blue onClick={() => setOpen(!isOpen)}>
                        {!isOpen && <BiChevronRight/>}
                        {isOpen && <BiChevronDown/>}
                    </ButtonPrimary>
                </HBox>
                {isOpen && <Spacer size={"xs"}/>}
                {isOpen && props.data.cities.map(city => <City key={props.data.provinceId} data={city} onOpen={() => props.onOpenCity(city.cityId)}/>)}
            </VBox>
        </DecoratedPanel>
    );
}


function City(props: { data: CityData, onOpen: () => void }) {
    return (
        <DecoratedPanel paddingSmall blue simpleBorder>
            <HBox centerVertical gap_s>
                <LinkButton onClick={props.onOpen}>{props.data.cityName}</LinkButton>
                {props.data.isCountryCapitol &&  <RiVipCrown2Fill/>}
                {props.data.isProvinceCapitol &&  <RiVipCrown2Line/>}
            </HBox>
        </DecoratedPanel>
    );
}