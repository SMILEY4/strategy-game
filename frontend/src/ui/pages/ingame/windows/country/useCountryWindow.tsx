import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {CountryWindow} from "./CountryWindow";
import {CountryRepository} from "../../../../../state/access/CountryRepository";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {AppCtx} from "../../../../../appContext";
import {UseCityWindow} from "../city/useCityWindow";
import {CountryView} from "../../../../../models/country";
import {ProvinceIdentifier} from "../../../../../models/province";
import {CityIdentifier} from "../../../../../models/city";
import {UseProvinceWindow} from "../province/useProvinceWindow";

export namespace UseCountryWindow {

    export function useOpen() {
        const addWindow = useOpenWindow();
        return (countryId: string, keepPosition: boolean) => {
            const WINDOW_ID = "menubar-window";
            addWindow({
                id: WINDOW_ID,
                className: "country-window",
                left: 25,
                top: 60,
                bottom: 25,
                width: 360,
                content: <CountryWindow windowId={WINDOW_ID} countryId={countryId}/>,
            }, keepPosition);
        };
    }

    export interface Data {
        country: CountryView,
        openWindow: {
            province: (province: ProvinceIdentifier) => void,
            city: (city: CityIdentifier) => void,
        };
    }

    export function useData(countryId: string): UseCountryWindow.Data {

        const country = CountryRepository.useCountryById(countryId);
        const commands = CommandRepository.useCommands();
        const countryView = AppCtx.DataViewService().getCountryView(country, commands);

        const openProvinceWindow = UseProvinceWindow.useOpen();
        const openCityWindow = UseCityWindow.useOpen();

        return {
            country: countryView,
            openWindow: {
                province: (province: ProvinceIdentifier) => openProvinceWindow(province.id, true),
                city: (city: CityIdentifier) => openCityWindow(city.id, true),
            },
        };
    }

}