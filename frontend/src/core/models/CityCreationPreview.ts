import {Route} from "./route";
import {TileRef} from "./tileRef";
import {TilePosition} from "./tilePosition";

export interface CityCreationPreview {
    position: TilePosition,
    isProvinceCapital: boolean,
    addedRoutes: Route[],
    claimedTiles: TileRef[]
}