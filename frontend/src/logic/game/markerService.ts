import {TileIdentifier} from "../../models/tile";
import {CommandDatabase} from "../../state/commandDatabase";
import {TileDatabase} from "../../state/tileDatabase";
import {CommandService} from "./commandService";
import {CommandType} from "../../models/commandType";
import {PlaceMarkerCommand} from "../../models/command";

export class MarkerService {

    private readonly commandDb: CommandDatabase;
    private readonly tileDb: TileDatabase;
    private readonly commandService: CommandService;

    constructor(commandDb: CommandDatabase, tileDb: TileDatabase, commandService: CommandService) {
        this.commandDb = commandDb;
        this.tileDb = tileDb;
        this.commandService = commandService;
    }

    public placeMarker(tile: TileIdentifier, label: string) {
        if (this.validatePlaceMarker(tile)) {
            this.commandService.placeMarker(tile, label);
        }
    }

    public deleteMarker(tile: TileIdentifier) {
        if (this.validateDeleteMarker(tile)) {
            this.commandService.deleteMarker(tile);
        }
    }

    public validatePlaceMarker(tile: TileIdentifier): boolean {
        return !this.existsMarker(tile) && !this.existsMarkerPlaceCommand(tile) && !this.existsMarkerDeleteCommand(tile);
    }

    public validateDeleteMarker(tile: TileIdentifier): boolean {
        return this.existsMarker(tile) && !this.existsMarkerPlaceCommand(tile) && !this.existsMarkerDeleteCommand(tile);
    }

    private existsMarker(tile: TileIdentifier): boolean {
        return this.tileDb.querySingleOrThrow(TileDatabase.QUERY_BY_ID, tile.id).objects
            .some(obj => obj.type === "marker");
    }

    private existsMarkerPlaceCommand(tile: TileIdentifier): boolean {
        return this.commandDb.queryMany(CommandDatabase.QUERY_BY_TYPE, CommandType.MARKER_PLACE)
            .some(obj => (obj as PlaceMarkerCommand).tile.id === tile.id);
    }

    private existsMarkerDeleteCommand(tile: TileIdentifier): boolean {
        return this.commandDb.queryMany(CommandDatabase.QUERY_BY_TYPE, CommandType.MARKER_DELETE)
            .some(obj => (obj as PlaceMarkerCommand).tile.id === tile.id);
    }

}