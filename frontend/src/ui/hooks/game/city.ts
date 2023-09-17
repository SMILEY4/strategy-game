import {CitiesStore} from "../../../logic/game/store/citiesStore";
import {City, CityIdentifier, ProductionEntry} from "../../../models/city";
import {AppCtx} from "../../../logic/appContext";
import {Tile, TileIdentifier} from "../../../models/tile";

export function useCity(cityId: string): City {
    const city = CitiesStore.useState(state => state.cities.find(c => c.identifier.id === cityId));
    if (city) {
        return city;
    } else {
        return City.UNDEFINED;
    }
}


export function useCreateSettlement(tile: Tile, name: string | null, asColony: boolean): [boolean, () => void] {
    const creationService = AppCtx.di.get(AppCtx.DIQ.CityCreationService);

    const possible = useValidateCreateSettlement(tile, name, asColony)

    function perform() {
        creationService.create(tile, name!!, asColony!!)
    }

    return [possible, perform]
}

export function useValidateCreateSettlement(tile: Tile, name: string | null, asColony: boolean): boolean {
    const creationService = AppCtx.di.get(AppCtx.DIQ.CityCreationService);
    return creationService.validate(tile, name, asColony);
}


export function useUpgradeSettlementTier(city: CityIdentifier, currentTier: number): [boolean, () => void] {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);

    const possible = true // todo: validate

    function perform() {
        commandService.upgradeSettlementTier(city, currentTier, currentTier+1)
    }

    return [possible, perform]
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

