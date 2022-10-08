import {WorldStore} from "../../external/state/world/worldStore";
import {City} from "../../models/state/city";
import {Country} from "../../models/state/country";
import {Marker} from "../../models/state/marker";
import {Scout} from "../../models/state/scout";
import {Tile} from "../../models/state/tile";

export interface WorldRepository {
    getRevisionId: () => string
    getCompleteState: () => WorldStore.StateValues

    set: (currentTurn: number, tiles: Tile[], countries: Country[], cities: City[], markers: Marker[], scouts: Scout[]) => void

    getTileAt: (x: number, y: number) => Tile | null
}