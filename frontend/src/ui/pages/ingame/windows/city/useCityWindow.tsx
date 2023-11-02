import {CityRepository} from "../../../../../state/access/CityRepository";
import {AppCtx} from "../../../../../appContext";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {City, CityIdentifier, CityView, ConnectedCityView} from "../../../../../models/city";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {CityWindow} from "./CityWindow";
import {UseCityConstructionWindow} from "../cityConstruction/useCityConstructionWindow";
import {UseCityProductionQueueWindow} from "../cityProductionQueue/useCityProductionQueueWindow";
import {ProductionQueueEntryView} from "../../../../../models/productionQueueEntry";
import {UseCountryWindow} from "../country/useCountryWindow";
import {UseProvinceWindow} from "../province/useProvinceWindow";
import {UseTileWindow} from "../tile/useTileWindow";

export namespace UseCityWindow {

    export function useOpen() {
        const addWindow = useOpenWindow();
        return (cityId: string, keepPosition: boolean) => {
            const WINDOW_ID = "menubar-window";
            addWindow(
                {
                    id: WINDOW_ID,
                    className: "city-window",
                    left: 25,
                    top: 60,
                    bottom: 25,
                    width: 360,
                    content: <CityWindow windowId={WINDOW_ID} cityId={cityId}/>,
                },
                keepPosition,
            );
        };
    }

    export interface Data {
        city: CityView,
        openWindow: {
            cityProductionQueue: () => void,
            cityConstruction: () => void,
            country: () => void,
            province: () => void,
            tile: () => void,
            connectedCity: (connectedCity: ConnectedCityView) => void
        },
        upgradeCityTier: {
            valid: boolean,
            reasonsInvalid: string[],
            upgrade: () => void
        },
        cancelProductionQueueEntry: (currentEntry: ProductionQueueEntryView | null) => void;
    }

    export function useData(cityId: string): UseCityWindow.Data {

        const city = CityRepository.useCityById(cityId);
        const commands = CommandRepository.useCommands();
        const cityView = AppCtx.DataViewService().getCityView(city, commands);

        const openCityWindow = UseCityWindow.useOpen()
        const openCityConstructionWindow = UseCityConstructionWindow.useOpen();
        const openCityQueueWindow = UseCityProductionQueueWindow.useOpen();
        const openCountryWindow = UseCountryWindow.useOpen();
        const openProvinceWindow = UseProvinceWindow.useOpen();
        const openTileWindow = UseTileWindow.useOpen();

        const [validUpgradeSettlement, reasonsValidationsUpgrade, upgradeSettlementTier] = useUpgradeSettlementTier(city);
        const cancelQueueEntry = useCancelQueueEntry(city.identifier);

        return {
            city: cityView,
            openWindow: {
                cityProductionQueue: () => openCityQueueWindow(city.identifier),
                cityConstruction: () => openCityConstructionWindow(city.identifier),
                country: () => openCountryWindow(city.country.id, true),
                province: () => openProvinceWindow(city.province.id, true),
                tile: () => openTileWindow(city.tile),
                connectedCity: (connectedCity: ConnectedCityView) => openCityWindow(connectedCity.city.id, true)
            },
            upgradeCityTier: {
                valid: validUpgradeSettlement,
                reasonsInvalid: reasonsValidationsUpgrade,
                upgrade: upgradeSettlementTier,
            },
            cancelProductionQueueEntry: entryView => entryView && cancelQueueEntry(entryView),
        };
    }

    function useUpgradeSettlementTier(city: City): [boolean, string[], () => void] {
        const upgradeService = AppCtx.CityUpgradeService();
        const invalidReasons = upgradeService.validate(city);
        return [
            invalidReasons.length === 0,
            invalidReasons,
            () => upgradeService.upgrade(city),
        ];
    }

    function useCancelQueueEntry(city: CityIdentifier) {
        const commandService = AppCtx.CommandService();
        return (entryView: ProductionQueueEntryView) => {
            if (entryView.command === null) {
                commandService.cancelProductionQueueEntry(city, entryView.entry);
            } else {
                commandService.cancelCommand(entryView.command.id);
            }
        };
    }

}

