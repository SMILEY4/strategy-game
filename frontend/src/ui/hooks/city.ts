import {Tile} from "../../models/tile";
import {AppCtx} from "../../appContext";

export function useCreateSettlement(tile: Tile, name: string | null, asColony: boolean): [boolean, string[], () => void] {
    const creationService = AppCtx.CityCreationService();
    const [possible, reasons] = useValidateCreateSettlement(tile, name, asColony);

    function perform() {
        creationService.create(tile, name!!, asColony!!);
    }

    return [possible, reasons, perform];
}

function useValidateCreateSettlement(tile: Tile | null, name: string | null, asColony: boolean): [boolean, string[]] {
    if (tile) {
        const creationService = AppCtx.CityCreationService();
        const result = creationService.validate(tile, name, asColony);
        return [result.length === 0, result];
    } else {
        return [false, ["No tile selected"]];
    }
}



