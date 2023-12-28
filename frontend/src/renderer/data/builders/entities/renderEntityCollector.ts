import {RenderEntity} from "./renderEntity";
import {Tile} from "../../../../models/tile";
import {City} from "../../../../models/city";
import {Command, CreateCityCommand, PlaceScoutCommand} from "../../../../models/command";
import {CommandType} from "../../../../models/commandType";
import {CountryIdentifier} from "../../../../models/country";
import {Color} from "../../../../models/color";
import {CommandDatabase} from "../../../../state_new/commandDatabase";
import {CityDatabase} from "../../../../state_new/cityDatabase";
import {TileDatabase} from "../../../../state_new/tileDatabase";

export class RenderEntityCollector {

    private readonly tileDb: TileDatabase;
    private readonly cityDb: CityDatabase;
    private readonly commandDb: CommandDatabase;

    constructor(tileDb: TileDatabase, cityDb: CityDatabase, commandDb: CommandDatabase) {
        this.tileDb = tileDb;
        this.cityDb = cityDb;
        this.commandDb = commandDb;
    }

    public collect(): RenderEntity[] {
        return this.collectEntities(
            this.tileDb.queryMany(TileDatabase.QUERY_ALL, null),
            this.cityDb.queryMany(CityDatabase.QUERY_ALL, null),
            this.commandDb.queryMany(CommandDatabase.QUERY_ALL, null),
        );
    }

    private collectEntities(tiles: Tile[], cities: City[], commands: Command[]): RenderEntity[] {

        const entities: RenderEntity[] = [];

        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            if (tile.content) {
                for (let j = 0; j < tile.content.length; j++) {
                    entities.push({
                        type: "scout",
                        tile: tile.identifier,
                        country: tile.content[j].country,
                        label: null,
                    });
                }
            }
        }

        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            entities.push({
                type: "city",
                tile: city.tile,
                country: city.country,
                label: city.identifier.name,
            });
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