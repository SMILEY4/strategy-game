import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {City, CityIdentifier} from "../../../../../models/city";
import React from "react";
import {CityProductionQueueWindow} from "./CityProductionQueueWindow";
import {CommandType} from "../../../../../models/commandType";
import {AddProductionQueueCommand, CancelProductionQueueCommand} from "../../../../../models/command";
import {AppCtx} from "../../../../../appContext";
import {
    BuildingProductionQueueEntry,
    ProductionQueueEntry,
    ProductionQueueEntryView,
    SettlerProductionQueueEntry,
} from "../../../../../models/productionQueueEntry";
import {BuildingConstructionEntry, SettlerConstructionEntry} from "../../../../../models/constructionEntry";
import {CommandDatabase} from "../../../../../state/commandDatabase";
import {CityDatabase} from "../../../../../state/cityDatabase";
import {getHiddenOrDefault} from "../../../../../models/hiddenType";

export namespace UseCityProductionQueueWindow {

    export function useOpen() {
        const WINDOW_ID = "city-production-queue";
        const addWindow = useOpenWindow();
        return (city: CityIdentifier) => {
            addWindow({
                id: WINDOW_ID,
                className: "city-production-queue",
                left: 350,
                top: 350,
                width: 350,
                height: 400,
                content: <CityProductionQueueWindow windowId={WINDOW_ID} city={city}/>,
            });
        };
    }


    export interface Data {
        queueEntries: ProductionQueueEntryView[];
        cancelEntry: (entry: ProductionQueueEntryView) => void;
    }


    export function useData(cityIdentifier: CityIdentifier): UseCityProductionQueueWindow.Data {
        const city = CityDatabase.useCityById(cityIdentifier.id);
        const queueEntries: ProductionQueueEntryView[] = useMergedProductionQueueEntries(city);
        const cancelEntry = useCancelEntry(cityIdentifier);
        return {
            queueEntries: queueEntries,
            cancelEntry: cancelEntry,
        };
    }

    function useMergedProductionQueueEntries(city: City): ProductionQueueEntryView[] {

        const cancelledEntries: string[] = CommandDatabase.useCommands()
            .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_CANCEL)
            .filter(cmd => (cmd as CancelProductionQueueCommand).city.id === city.identifier.id)
            .map(cmd => (cmd as CancelProductionQueueCommand).entry.id);

        const addCommands: AddProductionQueueCommand[] = CommandDatabase.useCommands()
            .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_ADD)
            .map(cmd => cmd as AddProductionQueueCommand)
            .filter(cmd => cmd.city.id === city.identifier.id);

        return [
            ...getHiddenOrDefault(city.productionQueue, [])
                .filter(e => cancelledEntries.indexOf(e.id) === -1)
                .map(e => ({
                    entry: e,
                    command: null,
                })),
            ...addCommands.map(cmd => ({
                entry: asProductionQueueEntry(cmd),
                command: cmd,
            })),
        ];
    }


    function asProductionQueueEntry(cmd: AddProductionQueueCommand): ProductionQueueEntry {
        if (cmd.entry instanceof SettlerConstructionEntry) {
            return new SettlerProductionQueueEntry(cmd.id, 0);
        }
        if (cmd.entry instanceof BuildingConstructionEntry) {
            return new BuildingProductionQueueEntry(cmd.id, 0, (cmd.entry as BuildingConstructionEntry).buildingType);
        }
        throw new Error("Unexpected construction-entry-type");
    }


    function useCancelEntry(city: CityIdentifier) {
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