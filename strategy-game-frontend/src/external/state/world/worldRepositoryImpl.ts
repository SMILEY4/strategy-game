import {WorldRepository} from "../../../core/required/worldRepository";
import {City} from "../../../models/state/city";
import {Country} from "../../../models/state/country";
import {Marker} from "../../../models/state/marker";
import {Scout} from "../../../models/state/scout";
import {Tile} from "../../../models/state/tile";
import {orNull} from "../../../shared/utils";
import {WorldStore} from "./worldStore";

export class WorldRepositoryImpl implements WorldRepository {

    getRevisionId(): string {
        return WorldStore.useState.getState().revisionId;
    }

    getCompleteState(): WorldStore.StateValues {
        return WorldStore.useState.getState();
    }

    set(currentTurn: number, tiles: Tile[], countries: Country[], cities: City[], markers: Marker[], scouts: Scout[]): void {
        WorldStore.useState.getState().setState(currentTurn, tiles, countries, cities, markers, scouts);
    }

    getTileAt(q: number, r: number): Tile | null {
        return orNull(WorldStore.useState.getState().tiles.find(t => t.position.q === q && t.position.r === r))
    }

}