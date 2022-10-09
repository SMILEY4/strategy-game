import {WorldStore} from "../../external/state/world/worldStore";
import {City} from "../../models/state/city";
import {TilePosition} from "../../models/state/tilePosition";
import {orNull} from "../../shared/utils";

export function useCityAt(pos: TilePosition | null): City | null {
    return orNull(WorldStore.useState(state => state.cities.find(c => c.tile.q === pos?.q && c.tile.r === pos?.r)));
}