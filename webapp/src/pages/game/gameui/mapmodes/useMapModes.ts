import {MapMode} from "@app/features/game/models/map-mode.ts";
import {useQuerySingleton} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";

interface MapModesViewModel {
    available: MapMode[],
    selected: MapMode,
    select: (mode: MapMode) => void
}

export function useMapModesViewModel(): MapModesViewModel {

    const mapMode = useQuerySingleton(DI.mapModeDatabase)

    return {
        available: MapMode.ALL,
        selected: mapMode,
        select: (mode: MapMode) => DI.mapModeDatabase.set(mode),
    }
}