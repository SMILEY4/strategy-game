import {CityRepository} from "../../../../../state/access/CityRepository";
import {AppCtx} from "../../../../../appContext";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {useOpenCountryWindow} from "../country/CountryWindow";
import {useOpenProvinceWindow} from "../province/ProvinceWindow";
import {useOpenTileWindow} from "../tile/TileWindow";
import {City, CityIdentifier, CityView, ProductionQueueEntry, ProductionQueueEntryView} from "../../../../../models/city";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import React from "react";
import {CityWindow} from "./CityWindow";
import {useOpenCityProductionQueueWindow} from "../cityProductionQueue/CityProductionQueue";
import {UseCityConstructionWindow} from "../cityConstruction/useCityConstructionWindow";

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

        const openCityConstructionWindow = UseCityConstructionWindow.useOpen();
        const openCityQueueWindow = useOpenCityProductionQueueWindow();
        const openCountryWindow = useOpenCountryWindow();
        const openProvinceWindow = useOpenProvinceWindow();
        const openTileWindow = useOpenTileWindow();

        const [validUpgradeSettlement, reasonsValidationsUpgrade, upgradeSettlementTier] = useUpgradeSettlementTier(city);
        const cancelQueueEntry = useCancelProductionQueueEntry(city.identifier);

        return {
            city: cityView,
            openWindow: {
                cityProductionQueue: () => openCityQueueWindow(city.identifier),
                cityConstruction: () => openCityConstructionWindow(city.identifier),
                country: () => openCountryWindow(city.country.id, true),
                province: () => openProvinceWindow(city.province.id, true),
                tile: () => openTileWindow(city.tile),
            },
            upgradeCityTier: {
                valid: validUpgradeSettlement,
                reasonsInvalid: reasonsValidationsUpgrade,
                upgrade: upgradeSettlementTier,
            },
            cancelProductionQueueEntry: entryView => entryView && cancelQueueEntry(entryView.entry),
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

    function useCancelProductionQueueEntry(city: CityIdentifier) {
        const commandService = AppCtx.CommandService();
        return (entry: ProductionQueueEntry) => {
            commandService.cancelProductionQueueEntry(city, entry);
        };
    }

}

