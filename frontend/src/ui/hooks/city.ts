import {CityIdentifier, ProductionEntry} from "../../models/city";
import {AppCtx} from "../../logic/appContext";
import {Tile} from "../../models/tile";

export function useCreateSettlement(tile: Tile, name: string | null, asColony: boolean): [boolean, string[], () => void] {
    const creationService = AppCtx.di.get(AppCtx.DIQ.CityCreationService);

    const [possible, reasons] = useValidateCreateSettlement(tile, name, asColony);

    function perform() {
        creationService.create(tile, name!!, asColony!!);
    }

    return [possible, reasons, perform];
}

export function useValidateCreateSettlement(tile: Tile | null, name: string | null, asColony: boolean): [boolean, string[]] {
    if (tile) {
        const creationService = AppCtx.di.get(AppCtx.DIQ.CityCreationService);
        const result = creationService.validate(tile, name, asColony);
        return [result.length === 0, result];
    } else {
        return [false, ["No tile selected"]];
    }
}


export function useUpgradeSettlementTier(city: CityIdentifier, currentTier: number): [boolean, string[], () => void] {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);

    const validationResult: string[] = []; // todo: validate
    const possible = validationResult.length === 0;

    function perform() {
        commandService.upgradeSettlementTier(city, currentTier, currentTier + 1);
    }

    return [possible, validationResult, perform];
}


export function useCancelProductionQueueEntry(city: CityIdentifier) {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);
    return (entryId: string) => {
        commandService.cancelProductionQueueEntry(city, entryId);
    };
}


export function useAddProductionEntry(city: CityIdentifier) {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);
    return (entry: ProductionEntry) => {
        commandService.addProductionQueueEntry(city, entry);
    };
}


export function useAvailableProductionEntries(cityId: string): ProductionEntry[] {
    return [
        {
            name: "FARM",
            icon: "farm.png",
            disabled: false,
        },
        {
            name: "WOODCUTTER",
            icon: "Woodcutter.png",
            disabled: false,
        },
        {
            name: "SETTLER",
            icon: "Woodcutter.png",
            disabled: false,
        },
    ];
}

