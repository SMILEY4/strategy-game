import {RenderEntity} from "./renderEntity";
import {Tile} from "../../../../models/tile";
import {Command, CreateCityCommand, PlaceMarkerCommand, PlaceScoutCommand} from "../../../../models/command";
import {CommandType} from "../../../../models/commandType";
import {CountryIdentifier} from "../../../../models/country";
import {Color} from "../../../../models/color";
import {CommandDatabase} from "../../../../state/commandDatabase";
import {TileDatabase} from "../../../../state/tileDatabase";
import {CityTileObject, MarkerTileObject, ScoutTileObject} from "../../../../models/tileObject";

export class RenderEntityCollector {

    private readonly tileDb: TileDatabase;
    private readonly commandDb: CommandDatabase;

    constructor(tileDb: TileDatabase, commandDb: CommandDatabase) {
        this.tileDb = tileDb;
        this.commandDb = commandDb;
    }

    public collect(): RenderEntity[] {
        return this.collectEntities(
            this.tileDb.queryMany(TileDatabase.QUERY_ALL, null),
            this.commandDb.queryMany(CommandDatabase.QUERY_ALL, null),
        );
    }

    private collectEntities(tiles: Tile[], commands: Command[]): RenderEntity[] {

        const deleteMarkersAt = commands
            .filter(cmd => cmd.type === CommandType.MARKER_DELETE)
            .map(cmd => (cmd as PlaceMarkerCommand).tile.id)
        
        const entities: RenderEntity[] = [];

        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            if (tile.objects) {
                for (let j = 0; j < tile.objects.length; j++) {
                    const objType = tile.objects[j].type
                    if(objType === "marker" && deleteMarkersAt.indexOf(tile.identifier.id) === -1) {
                        const obj = tile.objects[j] as MarkerTileObject
                        entities.push({
                            type: "marker",
                            tile: tile.identifier,
                            country: obj.country,
                            label: obj.label,
                        });
                    }
                    if(objType === "scout") {
                        const obj = tile.objects[j] as ScoutTileObject
                        entities.push({
                            type: "scout",
                            tile: tile.identifier,
                            country: obj.country,
                            label: null,
                        });
                    }
                    if(objType === "city") {
                        const obj = tile.objects[j] as CityTileObject
                        entities.push({
                            type: "city",
                            tile: tile.identifier,
                            country: obj.country,
                            label: obj.city.name,
                        });
                    }

                }
            }
        }

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.type === CommandType.SCOUT_PLACE) {
                entities.push({
                    type: "scout",
                    tile: (command as PlaceScoutCommand).tile,
                    country: this.placeholderCountry(),
                    label: null,
                });
            }
            if (command.type === CommandType.CITY_CREATE) {
                entities.push({
                    type: "city",
                    tile: (command as CreateCityCommand).tile,
                    country: this.placeholderCountry(),
                    label: (command as CreateCityCommand).name,
                });
            }
            if (command.type === CommandType.MARKER_PLACE) {
                entities.push({
                    type: "marker",
                    tile: (command as PlaceMarkerCommand).tile,
                    country: this.placeholderCountry(),
                    label: (command as PlaceMarkerCommand).label,
                });
            }
        }

        return entities;
    }

    private placeholderCountry(): CountryIdentifier {
        return {
            id: "undefined",
            name: "undefined",
            color: Color.BLACK,
        };
    }

}