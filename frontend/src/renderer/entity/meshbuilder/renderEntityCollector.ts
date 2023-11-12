import {RenderEntity} from "./renderEntity";
import {Tile} from "../../../models/tile";
import {City} from "../../../models/city";
import {Command, CreateCityCommand, PlaceScoutCommand} from "../../../models/command";
import {CommandType} from "../../../models/commandType";
import {CountryIdentifier} from "../../../models/country";
import {Color} from "../../../models/color";
import {TileRepository} from "../../../state/access/TileRepository";
import {CityRepository} from "../../../state/access/CityRepository";
import {CommandRepository} from "../../../state/access/CommandRepository";

export class RenderEntityCollector {

    private readonly tileRepository: TileRepository;
    private readonly cityRepository: CityRepository;
    private readonly commandRepository: CommandRepository;

    constructor(tileRepository: TileRepository, cityRepository: CityRepository, commandRepository: CommandRepository) {
        this.tileRepository = tileRepository;
        this.cityRepository = cityRepository;
        this.commandRepository = commandRepository;
    }

    public collect(): RenderEntity[] {
        return this.collectEntities(
            this.tileRepository.getTiles(),
            this.cityRepository.getCities(),
            this.commandRepository.getCommands(),
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