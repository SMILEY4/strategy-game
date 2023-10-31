import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {CityIdentifier} from "../../../../../models/city";
import React from "react";
import {CityConstructionWindow} from "./CityConstructionWindow";
import {BuildingType} from "../../../../../models/buildingType";
import {AppCtx} from "../../../../../appContext";
import {
    BuildingConstructionEntry,
    ConstructionEntry,
    ConstructionEntryView,
    SettlerConstructionEntry,
} from "../../../../../models/constructionEntry";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {CityRepository} from "../../../../../state/access/CityRepository";

export namespace UseCityConstructionWindow {

    export function useOpen() {
        const WINDOW_ID = "city-production";
        const addWindow = useOpenWindow();
        return (city: CityIdentifier) => {
            addWindow({
                id: WINDOW_ID,
                className: "city-production",
                left: 350,
                top: 350,
                width: 350,
                height: 400,
                content: <CityConstructionWindow windowId={WINDOW_ID} city={city}/>,
            });
        };
    }

    export interface Data {
        entries: ConstructionEntryView[],
        addEntry: (entry: ConstructionEntry) => void
    }

    export function useData(cityIdentifier: CityIdentifier): UseCityConstructionWindow.Data {
        const city = CityRepository.useCityById(cityIdentifier.id);
        const commands = CommandRepository.useCommands();
        const dataViewService = AppCtx.DataViewService();
        const entries: ConstructionEntryView[] = useAvailableConstructionEntries()
            .map(entry => dataViewService.getConstructionEntryView(entry, city, commands));
        const addEntry = useAddEntry(cityIdentifier);
        return {
            entries: entries,
            addEntry: addEntry,
        };
    }

    function useAvailableConstructionEntries(): ConstructionEntry[] {
        const options: ConstructionEntry[] = [];
        options.push(new SettlerConstructionEntry());
        BuildingType.getValues().forEach(buildingType => {
            options.push(new BuildingConstructionEntry(buildingType));
        });
        return options;
    }

    function useAddEntry(city: CityIdentifier) {
        const commandService = AppCtx.CommandService();
        return (entry: ConstructionEntry) => {
            commandService.addProductionQueueEntry(city, entry);
        };
    }

}