import {Country} from "../../models/country";
import {Province} from "../../models/province";
import {City} from "../../models/city";
import {TileContainer} from "../../models/tileContainer";
import {Route} from "../../models/route";


export interface RemoteGameState {
    countries: Country[],
    provinces: Province[],
    cities: City[],
    tiles: TileContainer,
    routes: Route[],
}

export const INITIAL_REMOTE_GAME_STATE: RemoteGameState = {
    countries: [],
    provinces: [],
    cities: [],
    tiles: TileContainer.create([], 11),
    routes: []
};
