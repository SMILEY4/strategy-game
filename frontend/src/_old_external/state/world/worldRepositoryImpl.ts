import {Province} from "../../../_old_core/models/province";
import {Route} from "../../../_old_core/models/route";
import {WorldRepository} from "../../../_old_core/required/worldRepository";
import {City} from "../../../_old_core/models/city";
import {Country} from "../../../_old_core/models/country";
import {Marker} from "../../../_old_core/models/marker";
import {Scout} from "../../../_old_core/models/scout";
import {Tile} from "../../../_old_core/models/tile";
import {orNull} from "../../../shared/utils";
import {WorldStore} from "./worldStore";

export class WorldRepositoryImpl implements WorldRepository {

    getRevisionId(): string {
        return WorldStore.useState.getState().revisionId;
    }

    getCompleteState(): WorldStore.StateValues {
        return WorldStore.useState.getState();
    }

    set(currentTurn: number,
        tiles: Tile[],
        countries: Country[],
        cities: City[],
        provinces: Province[],
        markers: Marker[],
        scouts: Scout[],
        routes: Route[]
    ): void {
        WorldStore.useState.getState().setState(currentTurn, tiles, countries, cities, provinces, markers, scouts, routes);
    }

    getTileAt(q: number, r: number): Tile | null {
        return orNull(WorldStore.useState.getState().tiles.find(t => t.position.q === q && t.position.r === r))
    }

}