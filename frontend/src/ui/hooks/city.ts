import {City, CityIdentifier, ProductionEntry} from "../../models/city";
import {AppCtx} from "../../logic/appContext";
import {Tile} from "../../models/tile";
import {BuildingType} from "../../models/buildingType";

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

export function useUpgradeSettlementTier(city: City): [boolean, string[], () => void] {
    const upgradeService = AppCtx.di.get(AppCtx.DIQ.CityUpgradeService);
    const [possible, reasons] = useValidateUpgradeSettlementTier(city);

    function perform() {
        upgradeService.upgrade(city)
    }

    return [possible, reasons, perform];
}

export function useValidateUpgradeSettlementTier(city: City): [boolean, string[]] {
    const upgradeService = AppCtx.di.get(AppCtx.DIQ.CityUpgradeService);
    const result = upgradeService.validate(city);
    return [result.length === 0, result];
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


export function useAvailableProductionEntries(): ProductionEntry[] {
    const options: ProductionEntry[] = [];
    options.push({
        type: "settler",
        icon: "/icons/buildings/farm.png",
        disabled: false,
        buildingData: null,
        settlerData: {},
    });
    BuildingType.getValues().forEach(buildingType => {
        options.push({
            type: "building",
            disabled: false,
            icon: buildingType.icon,
            buildingData: {
                type: buildingType,
            },
            settlerData: null,
        });
    });
    return options;
}
