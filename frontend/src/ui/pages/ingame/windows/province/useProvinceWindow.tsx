import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {ProvinceWindow} from "./ProvinceWindow";
import {ProvinceRepository} from "../../../../../state/access/ProvinceRepository";
import {AppCtx} from "../../../../../appContext";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {UseCountryWindow} from "../country/useCountryWindow";
import {UseCityWindow} from "../city/useCityWindow";
import {ProvinceView} from "../../../../../models/province";
import {CityIdentifier} from "../../../../../models/city";

export namespace UseProvinceWindow {

    export function useOpen() {
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


    export interface Data {
        province: ProvinceView,
        openWindow: {
            country: () => void,
            city: (city: CityIdentifier) => void
        }
    }


    export function useData(provinceId: string): UseProvinceWindow.Data {

        const province = ProvinceRepository.useProvinceById(provinceId);
        const commands = CommandRepository.useCommands();
        const provinceView = AppCtx.DataViewService().getProvinceView(province, commands);

        const openCountryWindow = UseCountryWindow.useOpen();
        const openCityWindow = UseCityWindow.useOpen();

        return {
            province: provinceView,
            openWindow: {
                country: () => openCountryWindow(province.country.id, true),
                city: (city: CityIdentifier) => openCityWindow(city.id, true),
            },
        };
    }

}