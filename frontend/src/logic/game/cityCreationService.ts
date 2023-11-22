import {Tile, TileIdentifier} from "../../models/tile";
import {Country} from "../../models/country";
import {getMaxOrDefault, orDefault} from "../../shared/utils";
import {CommandService} from "./commandService";
import {UserService} from "../user/userService";
import {GameConfigRepository} from "../../state/access/GameConfigRepository";
import {CountryRepository} from "../../state/access/CountryRepository";
import {CommandRepository} from "../../state/access/CommandRepository";
import {CommandType} from "../../models/commandType";
import {CreateCityCommand} from "../../models/command";
import {ProvinceIdentifier} from "../../models/province";
import {TerrainType} from "../../models/terrainType";

export class CityCreationService {

    private readonly commandService: CommandService;
    private readonly userService: UserService;
    private readonly gameConfigRepository: GameConfigRepository;
    private readonly countryRepository: CountryRepository;
    private readonly commandRepository: CommandRepository;

    constructor(
        commandService: CommandService,
        userService: UserService,
        gameConfigRepository: GameConfigRepository,
        countryRepository: CountryRepository,
        commandRepository: CommandRepository,
    ) {
        this.commandService = commandService;
        this.userService = userService;
        this.gameConfigRepository = gameConfigRepository;
        this.countryRepository = countryRepository;
        this.commandRepository = commandRepository;
    }


    public validate(tile: Tile, name: string | null, asColony: boolean): string[] {
        const country = this.getPlayerCountry();
        const failureReasons: string[] = [];
        if (name !== null && !name) {
            failureReasons.push("Invalid name");
        }
        if (tile.terrainType !== TerrainType.LAND) {
            failureReasons.push("Invalid terrain type");
        }
        if (this.isOccupied(tile)) {
            failureReasons.push("Tile is already occupied");
        }
        if (orDefault(this.availableSettlers(country), 0) <= 0) {
            failureReasons.push("No settlers available");
        }
        if (asColony) {
            // must:  (tile not owned OR owned by country) AND tile not owned by any city
            if ((tile.owner !== null && (tile.owner?.country.id !== country.identifier.id || tile.owner?.city !== null))) {
                failureReasons.push("Invalid tile owner");
            }
            if (!this.validInfluence(tile, country)) {
                failureReasons.push("Not enough influence on tile");
            }
        } else {
            // must: country owns tile AND tile not owned by any city
            if (tile.owner?.country.id !== country.identifier.id || tile.owner.city !== null) {
                failureReasons.push("Invalid tile owner");
            }
        }
        return failureReasons;
    }

    public create(tile: Tile, name: string, province: ProvinceIdentifier | null) {
        this.commandService.createSettlement(tile.identifier, name, province);
    }

    private getPlayerCountry(): Country {
        return this.countryRepository.getCountryByUserId(this.userService.getUserId());
    }

    private isOccupied(tile: Tile): boolean {
        return this.getCityPositions().findIndex(t => t.id === tile.identifier.id) !== -1
            || this.commandRepository.getCommands().some(cmd => cmd.type === CommandType.CITY_CREATE && (cmd as CreateCityCommand).tile.id === tile.identifier.id);
    }

    private getCityPositions(): TileIdentifier[] {
        return [];
    }

    private availableSettlers(country: Country): number | null {
        return country.settlers;
    }

    private validInfluence(tile: Tile, country: Country): boolean {
        if (tile.owner?.country.id === country.identifier.id) {
            return true;
        }
        const maxForeignInfluence = getMaxOrDefault(
            tile.influences
                .filter(i => i.country.id !== country.identifier.id)
                .map(i => i.amount),
            e => e,
            0,
        );
        const cityTileMaxForeignInfluence = this.gameConfigRepository.getGameConfig().cityTileMaxForeignInfluence;
        if (maxForeignInfluence < cityTileMaxForeignInfluence) {
            return true;
        }
        const maxOwnInfluence = getMaxOrDefault(
            tile.influences
                .filter(i => i.country.id === country.identifier.id)
                .map(i => i.amount),
            e => e,
            0,
        );
        if (maxOwnInfluence >= maxForeignInfluence) {
            return true;
        }
        return false;
    }

}