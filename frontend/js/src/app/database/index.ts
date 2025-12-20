import {CameraDatabase} from "./cameraDatabase";
import {CommandDatabase} from "./commandDatabase";
import {RealmDatabase} from "./realmDatabase";
import {GameSessionDatabase} from "./gameSessionDatabase";
import {TileDatabase} from "./tileDatabase";
import {WorldObjectDatabase} from "./worldObjectDatabase";
import {RouteDatabase} from "./routesDatabase";

export const Db = {
    camera: new CameraDatabase(),
    command: new CommandDatabase(),
    realm: new RealmDatabase(),
    gameSession: new GameSessionDatabase(),
    tile: new TileDatabase(),
    worldObject: new WorldObjectDatabase(),
    route: new RouteDatabase(),
};
