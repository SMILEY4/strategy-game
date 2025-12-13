import {WorldObject} from "../../../models/worldobject/worldObject";
import {App} from "../../../appContext";

export function disbandWorldObject(id: WorldObject.Id) {
    App.gameProxy.disbandWorldObject(id)
}