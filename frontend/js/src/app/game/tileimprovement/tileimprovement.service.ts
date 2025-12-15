import {WorldObject} from "../../../models/worldobject/worldObject";
import {CommandService} from "../command/command.service";
import {Command} from "../../../models/command/command";

export const TileImprovementService = {

    construct(worldObject: WorldObject.Id, type: string) {
        CommandService.addCommand({
            type: Command.Type.ConstructTileImprovement,
            id: Command.genId(),
            worldObjectId: worldObject,
            tileImprovementType: type,
        });
    },

};