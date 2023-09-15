import {CommandService} from "../commandService";
import {TileIdentifier} from "../../../models/tile";

export class CreateSettlementAction {

    private readonly commandService: CommandService;

    constructor(commandService: CommandService) {
        this.commandService = commandService;
    }

    create(tile: TileIdentifier, name: string, asColony: boolean) {

    }

    validate(tile: TileIdentifier, name: string, asColony: boolean) {

    }

}