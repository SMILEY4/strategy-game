import {WorldRepository} from "../../../core/required/worldRepository";
import {City} from "../../../core/models/city";
import {Country} from "../../../core/models/country";
import {Marker} from "../../../core/models/marker";
import {Scout} from "../../../core/models/scout";
import {Tile} from "../../../core/models/tile";
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