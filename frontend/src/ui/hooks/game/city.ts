import {CitiesStore} from "../../../logic/game/store/citiesStore";
import {City, CityIdentifier, ProductionEntry} from "../../../models/city";
import {AppCtx} from "../../../logic/appContext";
import {TileIdentifier} from "../../../models/tile";

export function useCity(cityId: string): City {
    const city = CitiesStore.useState(state => state.cities.find(c => c.identifier.id === cityId));
    if (city) {
        return city;
    } else {
        return City.UNDEFINED;
    }
}


export function useCreateSettlement(tile: TileIdentifier): [boolean, (name: string, withNewProvince: boolean) => void] {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);
    const possible = true // todo: validate

    function perform(name: string, withNewProvince: boolean) {
        commandService.createSettlement(tile, name, withNewProvince)
    }

    return [possible, perform]
}


export function useUpgradeSettlementTier(city: CityIdentifier): [boolean, () => void] {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);
    const possible = true // todo: validate

    function perform() {
        commandService.upgradeSettlementTier(city)
    }

    return [possible, perform]
}


export function useCancelCurrentProductionQueueEntry(cityId: string) {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);
    return () => {
        commandService.cancelProductionQueueEntry(cityId);
    };
}


export function useAddProductionEntry(cityId: string) {
    const commandService = AppCtx.di.get(AppCtx.DIQ.CommandService);
    return (entry: ProductionEntry) => {
        commandService.addProductionQueueEntry(cityId, entry);
    };
}




export function useAvailableProductionEntries(cityId: string): ProductionEntry[] {
    return [
        {
            name: "Farm",
            icon: "farm.png",
            disabled: false,
        },
        {
            name: "Woodcutter",
            icon: "Woodcutter.png",
            disabled: false,
        },
        {
            name: "Farm II",
            icon: "farm.png",
            disabled: true,
        },
        {
            name: "Woodcutter II",
            icon: "Woodcutter.png",
            disabled: true,
        },
        {
            name: "Settler",
            icon: "Woodcutter.png",
            disabled: false,
        },
    ];
}

