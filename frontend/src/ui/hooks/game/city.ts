import {CityIdentifier, ProductionEntry} from "../../../models/city";
import {AppCtx} from "../../../logic/appContext";
import {Tile} from "../../../models/tile";

export function useCreateSettlement(tile: Tile, name: string | null, asColony: boolean): [boolean, () => void] {
    const creationService = AppCtx.di.get(AppCtx.DIQ.CityCreationService);

    const possible = useValidateCreateSettlement(tile, name, asColony);

    function perform() {
        creationService.create(tile, name!!, asColony!!);
    }

    return [possible, perform];
}

export function useValidateCreateSettlement(tile: Tile | null, name: string | null, asColony: boolean): boolean {
    if (tile) {
        const creationService = AppCtx.di.get(AppCtx.DIQ.CityCreationService);
        return creationService.validate(tile, name, asColony);
    } else {
        return false;
    }
}


export function useUpgradeSettlementTier(city: CityIdentifier, currentTier: number): [boolean, () => void] {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);

    const possible = true; // todo: validate

    function perform() {
        commandService.upgradeSettlementTier(city, currentTier, currentTier + 1);
    }

    return [possible, perform];
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

