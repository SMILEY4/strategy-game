import {GameSessionClient} from "../gamesession/gameSessionClient";
import {
    Command,
    CreateSettlementCommand,
    PlaceScoutCommand,
    ProductionQueueAddCommand,
    ProductionQueueCancelCommand,
    UpgradeSettlementCommand,
} from "../../models/command";
import {CommandRepository} from "../../state/access/CommandRepository";

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
        if (command.type === "production-queue-entry.add") {
            const cmd = command as ProductionQueueAddCommand;
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
        if (command.type === "production-queue-entry.cancel") {
            const cmd = command as ProductionQueueCancelCommand;
            return {
                type: "production-queue-remove-entry",
                cityId: cmd.city.id,
                queueEntryId: cmd.entryId,
            };
        }
        if (command.type === "settlement.create") {
            const cmd = command as CreateSettlementCommand;
            return {
                type: "create-city",
                q: cmd.tile.q,
                r: cmd.tile.r,
                name: cmd.name,
                withNewProvince: cmd.asColony,
            };
        }
        if (command.type === "settlement.upgrade") {
            const cmd = command as UpgradeSettlementCommand;
            return {
                type: "upgrade-settlement-tier",
                cityId: cmd.settlement.id,
            };
        }
        if (command.type === "scout.place") {
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