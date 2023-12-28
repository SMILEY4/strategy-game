import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {ProvinceWindow} from "./ProvinceWindow";
import {AppCtx} from "../../../../../appContext";
import {UseCountryWindow} from "../country/useCountryWindow";
import {UseCityWindow} from "../city/useCityWindow";
import {ProvinceView} from "../../../../../models/province";
import {CityReduced} from "../../../../../models/city";
import {UseCityPlannedWindow} from "../cityPlanned/useCityPlannedWindow";
import {CommandDatabase} from "../../../../../state_new/commandDatabase";
import {ProvinceDatabase} from "../../../../../state_new/provinceDatabase";

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
            city: (city: CityReduced) => void
        }
    }


    export function useData(provinceId: string): UseProvinceWindow.Data {

        const province = ProvinceDatabase.useProvinceById(provinceId);
        const commands = CommandDatabase.useCommands();
        const provinceView = AppCtx.DataViewService().getProvinceView(province, commands);

        const openCountryWindow = UseCountryWindow.useOpen();
        const openCityWindow = UseCityWindow.useOpen();
        const openCityPlannedWindow = UseCityPlannedWindow.useOpen();

        return {
            province: provinceView,
            openWindow: {
                country: () => openCountryWindow(province.country.id, true),
                city: (city: CityReduced) => {
                    if (city.isPlanned) {
                        openCityPlannedWindow(city.createCommand!.id, true);
                    } else {
                        openCityWindow(city.identifier.id, true);
                    }

                },
            },
        };
    }

}