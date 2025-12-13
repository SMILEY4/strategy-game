import {App} from "../../../appContext";
import {WorldObject} from "../../../models/worldobject/worldObject";

export function constructTileImprovement(worldObject: WorldObject.Id, type: string) {
    App.gameProxy.constructTileImprovement(worldObject, type);
}