import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {CountryWindow} from "./CountryWindow";
import {CountryRepository} from "../../../../../state/access/CountryRepository";
import {AppCtx} from "../../../../../appContext";
import {UseCityWindow} from "../city/useCityWindow";
import {CountryView} from "../../../../../models/country";
import {ProvinceReduced} from "../../../../../models/province";
import {CityReduced} from "../../../../../models/city";
import {UseProvinceWindow} from "../province/useProvinceWindow";
import {UseCityPlannedWindow} from "../cityPlanned/useCityPlannedWindow";
import {CommandDatabase} from "../../../../../state_new/commandDatabase";

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
            province: (province: ProvinceReduced) => void,
            city: (city: CityReduced) => void,
        };
    }

    export function useData(countryId: string): UseCountryWindow.Data {

        const country = CountryRepository.useCountryById(countryId);
        const commands = CommandDatabase.useCommands();
        const countryView = AppCtx.DataViewService().getCountryView(country, commands);

        const openProvinceWindow = UseProvinceWindow.useOpen();
        const openCityWindow = UseCityWindow.useOpen();
        const openCityPlannedWindow = UseCityPlannedWindow.useOpen();

        return {
            country: countryView,
            openWindow: {
                province: (province: ProvinceReduced) => {
                    if (province.isPlanned) {
                        // do nothing
                    } else {
                        openProvinceWindow(province.identifier.id, true);
                    }
                },
                city: (city: CityReduced) => {
                    if (city.isPlanned) {
                        openCityPlannedWindow(city.createCommand!.id, true)
                    } else {
                        openCityWindow(city.identifier.id, true);
                    }
                },
            },
        };
    }

}