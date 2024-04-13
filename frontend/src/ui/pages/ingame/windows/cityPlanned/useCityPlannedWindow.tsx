import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {CityPlannedWindow} from "./CityPlannedWindow";
import {CountryIdentifier} from "../../../../../models/country";
import {ProvinceIdentifier} from "../../../../../models/province";
import {TileIdentifier} from "../../../../../models/tile";
import {UseCountryWindow} from "../country/useCountryWindow";
import {UseProvinceWindow} from "../province/useProvinceWindow";
import {UseTileWindow} from "../tile/useTileWindow";
import {CreateCityCommand} from "../../../../../models/command";
import {AppCtx} from "../../../../../appContext";
import {CommandDatabase} from "../../../../../state/commandDatabase";
import {CountryDatabase} from "../../../../../state/countryDatabase";

export namespace UseCityPlannedWindow {

    export function useOpen() {
        const addWindow = useOpenWindow();
        return (commandId: string, keepPosition: boolean) => {
            const WINDOW_ID = "menubar-window";
            addWindow(
                {
                    id: WINDOW_ID,
                    className: "city-planned-window",
                    left: 25,
                    top: 60,
                    bottom: 25,
                    width: 360,
                    content: <CityPlannedWindow windowId={WINDOW_ID} commandId={commandId}/>,
                },
                keepPosition,
            );
        };
    }

    export interface Data {
        name: string,
        country: CountryIdentifier,
        province: ProvinceIdentifier | null
        tile: TileIdentifier,
        openWindow: {
            country: () => void,
            province: () => void,
            tile: () => void
        },
        cancel: () => void
    }

    export function useData(commandId: string): UseCityPlannedWindow.Data {

        const command = CommandDatabase.useCommandById(commandId) as CreateCityCommand;
        const country = CountryDatabase.useCountryByUserId(AppCtx.UserService().getUserId());

        const openCountryWindow = UseCountryWindow.useOpen();
        const openProvinceWindow = UseProvinceWindow.useOpen();
        const openTileWindow = UseTileWindow.useOpen();

        return {
            name: command.name,
            country: country.identifier,
            province: command.province,
            tile: command.tile,
            openWindow: {
                country: () => openCountryWindow(country.identifier.id, true),
                province: () => command.province && openProvinceWindow(command.province.id, true),
                tile: () => openTileWindow(command.tile),
            },
            cancel: () => {
                openCountryWindow(country.identifier.id, true);
                AppCtx.CommandService().cancelCommand(commandId);
            },
        };
    }

}