import {GameSessionClient} from "../gamesession/gameSessionClient";
import {
    AddProductionQueueCommand,
    CancelProductionQueueCommand,
    Command,
    CreateCityCommand,
    PlaceScoutCommand,
    UpgradeCityCommand,
} from "../../models/command";
import {CommandRepository} from "../../state/access/CommandRepository";
import {CommandType} from "../../models/commandType";

export class EndTurnService {

    private readonly gameSessionClient: GameSessionClient;
    private readonly commandRepository: CommandRepository;

    constructor(gameSessionClient: GameSessionClient, commandRepository: CommandRepository) {
        this.gameSessionClient = gameSessionClient;
        this.commandRepository = commandRepository;
    }

    public endTurn() {
        const commands = this.commandRepository.getCommands();
        this.gameSessionClient.sendMessage(
            "submit-turn",
            {commands: commands.map(c => this.buildPayloadCommand(c))},
        );
        this.commandRepository.setCommands([]);
    }

    private buildPayloadCommand(command: Command): object {
        if (command.type === CommandType.PRODUCTION_QUEUE_ADD) {
            const cmd = command as AddProductionQueueCommand;
            switch (cmd.entry.type) {
                case "building":
                    return {
                        type: "production-queue-add-entry.building",
                        cityId: cmd.city.id,
                        buildingType: cmd.entry.buildingData!.type.id,
                    };
                case "settler":
                    return {
                        type: "production-queue-add-entry.settler",
                        cityId: cmd.city.id,
                    };

            }
        }
        if (command.type === CommandType.PRODUCTION_QUEUE_CANCEL) {
            const cmd = command as CancelProductionQueueCommand;
            return {
                type: "production-queue-remove-entry",
                cityId: cmd.city.id,
                queueEntryId: cmd.entryId,
            };
        }
        if (command.type === CommandType.CITY_CREATE) {
            const cmd = command as CreateCityCommand;
            return {
                type: "create-city",
                q: cmd.tile.q,
                r: cmd.tile.r,
                name: cmd.name,
                withNewProvince: cmd.asColony,
            };
        }
        if (command.type === CommandType.CITY_UPGRADE) {
            const cmd = command as UpgradeCityCommand;
            return {
                type: "upgrade-settlement-tier",
                cityId: cmd.city.id,
            };
        }
        if (command.type === CommandType.SCOUT_PLACE) {
            const cmd = command as PlaceScoutCommand;
            return {
                type: "place-scout",
                q: cmd.tile.q,
                r: cmd.tile.r,
            };
        }
        throw new Error("Unknown command type: " + command.type + " (" + command.id + ")");
    }

}