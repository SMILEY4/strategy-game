import {WorldObject} from "../../../models/worldobject/worldObject";
import {CommandService} from "../command/game.command.service";
import {Command} from "../../../models/command/command";

export const WorldObjectService = {

    disband(id: WorldObject.Id) {
        CommandService.addCommand({
            type: Command.Type.Disband,
            id: Command.genId(),
            worldObjectId: id,
        });
    }

}