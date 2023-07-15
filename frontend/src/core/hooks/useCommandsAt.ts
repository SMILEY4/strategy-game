import {GameStore} from "../../external/state/game/gameStore";
import {
    Command,
    CommandCreateCity,
    CommandPlaceMarker,
    CommandProductionQueueAddBuildingEntry,
    CommandProductionQueueAddSettlerEntry,
} from "../models/command";
import {TilePosition} from "../models/tilePosition";
import {useCities} from "./useCities";

export function useCommandsAt(pos: TilePosition | null): Command[] {
    const cities = useCities();
    return GameStore.useState(state => state.commands.filter(cmd => {
        if (pos) {
            if (cmd.commandType === "place-marker") {
                const cmdMarker = cmd as CommandPlaceMarker;
                return cmdMarker.q === pos.q && cmdMarker.r === pos.r;
            }
            if (cmd.commandType === "create-city") {
                const cmdCity = cmd as CommandCreateCity;
                return cmdCity.q === pos.q && cmdCity.r === pos.r;
            }
            if (cmd.commandType === "production-queue-add-entry.building") {
                const cmdBuilding = cmd as CommandProductionQueueAddBuildingEntry;
                const city = cities.find(c => c.cityId === cmdBuilding.cityId);
                return city?.tile?.q === pos.q && city?.tile?.r === pos.r;
            }
            if (cmd.commandType === "production-queue-add-entry.settler") {
                const cmdSettler = cmd as CommandProductionQueueAddSettlerEntry;
                const city = cities.find(c => c.cityId === cmdSettler.cityId);
                return city?.tile?.q === pos.q && city?.tile?.r === pos.r;
            }
        } else {
            return false;
        }
    }));
}