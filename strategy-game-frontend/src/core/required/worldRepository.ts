import {WorldStore} from "../../external/state/world/worldStore";
import {City} from "../models/city";
import {Country} from "../models/country";
import {Marker} from "../models/marker";
import {Scout} from "../models/scout";
import {Tile} from "../models/tile";

export interface WorldRepository {
    getRevisionId: () => string
    getCompleteState: () => WorldStore.StateValues

    set: (currentTurn: number, tiles: Tile[], countries: Country[], cities: City[], markers: Marker[], scouts: Scout[]) => void

    getTileAt: (x: number, y: number) => Tile | null
}