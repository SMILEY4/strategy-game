import {WorldRepository} from "../../core/required/worldRepository";
import {City} from "../../models/state/city";
import {Country} from "../../models/state/country";
import {Marker} from "../../models/state/marker";
import {Scout} from "../../models/state/scout";
import {Tile} from "../../models/state/tile";
import {orNull} from "../../shared/utils";
import {GameStore} from "./game/gameStore";

export class WorldRepositoryImpl implements WorldRepository {

    getRevisionId(): string {
        return GameStore.useState.getState().revisionId;
    }

    getCompleteState(): GameStore.StateValues {
        return GameStore.useState.getState();
    }

    set(currentTurn: number, tiles: Tile[], countries: Country[], cities: City[], markers: Marker[], scouts: Scout[]): void {
        GameStore.useState.getState().setState(currentTurn, tiles, countries, cities, markers, scouts);
    }

    getTileAt(q: number, r: number): Tile | null {
        return orNull(GameStore.useState.getState().tiles.find(t => t.position.q === q && t.position.r === r))
    }

}