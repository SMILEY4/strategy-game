import {GameSessionClient} from "../gamesession/gameSessionClient";
import {
    AddProductionQueueCommand,
    CancelProductionQueueCommand,
    Command,
    CreateCityCommand, DeleteMarkerCommand, PlaceMarkerCommand,
    PlaceScoutCommand,
    UpgradeCityCommand,
} from "../../models/command";
import {CommandType} from "../../models/commandType";
import {BuildingConstructionEntry, SettlerConstructionEntry} from "../../models/constructionEntry";
import {CommandDatabase} from "../../state/commandDatabase";

export class EndTurnService {

    private readonly gameSessionClient: GameSessionClient;
    private readonly commandDb: CommandDatabase;

    constructor(gameSessionClient: GameSessionClient, commandDb: CommandDatabase) {
        this.gameSessionClient = gameSessionClient;
        this.commandDb = commandDb;
    }

    public endTurn() {
        const commands = this.commandDb.queryMany(CommandDatabase.QUERY_ALL, null);
        this.gameSessionClient.sendMessage(
            "submit-turn",
            {commands: commands.map(c => this.buildPayloadCommand(c))},
        );
        this.commandDb.deleteAll();
    }

    private buildPayloadCommand(command: Command): object {
        if (command.type === CommandType.PRODUCTION_QUEUE_ADD) {
            const cmd = command as AddProductionQueueCommand;
            if (cmd.entry instanceof SettlerConstructionEntry) {
                return {
                    type: "production-queue-add-entry.settler",
                    cityId: cmd.city.id,
                };
            } else if (cmd.entry instanceof BuildingConstructionEntry) {
                return {
                    type: "production-queue-add-entry.building",
                    cityId: cmd.city.id,
                    buildingType: cmd.entry.buildingType.id,
                };
            } else {
                console.warn("Unknown construction-entry-type:", cmd.entry);
            }
        }
        if (command.type === CommandType.PRODUCTION_QUEUE_CANCEL) {
            const cmd = command as CancelProductionQueueCommand;
            return {
                type: "production-queue-remove-entry",
                cityId: cmd.city.id,
                queueEntryId: cmd.entry.id,
            };
        }
        if (command.type === CommandType.CITY_CREATE) {
            const cmd = command as CreateCityCommand;
            return {
                type: "create-city",
                q: cmd.tile.q,
                r: cmd.tile.r,
                name: cmd.name,
                withNewProvince: cmd.province === null,
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
        if (command.type === CommandType.MARKER_PLACE) {
            const cmd = command as PlaceMarkerCommand;
            return {
                type: "place-marker",
                q: cmd.tile.q,
                r: cmd.tile.r,
                label: cmd.label
            };
        }
        if (command.type === CommandType.MARKER_DELETE) {
            const cmd = command as DeleteMarkerCommand;
            return {
                type: "delete-marker",
                q: cmd.tile.q,
                r: cmd.tile.r,
            };
        }
        throw new Error("Unknown command type: " + command.type.id + " (" + command.id + ")");
    }

}