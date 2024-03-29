import {Tile, TileIdentifier} from "../../models/tile";
import {Country} from "../../models/country";
import {getMaxOrDefault, orDefault} from "../../shared/utils";
import {CommandService} from "./commandService";
import {UserService} from "../user/userService";
import {CommandType} from "../../models/commandType";
import {CreateCityCommand} from "../../models/command";
import {ProvinceIdentifier} from "../../models/province";
import {TerrainType} from "../../models/terrainType";
import {GameSessionDatabase} from "../../state/gameSessionDatabase";
import {CommandDatabase} from "../../state/commandDatabase";
import {CountryDatabase} from "../../state/countryDatabase";
import {CityDatabase} from "../../state/cityDatabase";
import {getHiddenOrDefault, getHiddenOrNull} from "../../models/hiddenType";

export class CityCreationService {

    private readonly commandService: CommandService;
    private readonly userService: UserService;
    private readonly gameSessionDb: GameSessionDatabase;
    private readonly commandDb: CommandDatabase;
    private readonly countryDb: CountryDatabase;
    private readonly cityDb: CityDatabase

    constructor(
        commandService: CommandService,
        userService: UserService,
        gameSessionDb: GameSessionDatabase,
        commandDb: CommandDatabase,
        countryDb: CountryDatabase,
        cityDb: CityDatabase
    ) {
        this.commandService = commandService;
        this.userService = userService;
        this.gameSessionDb = gameSessionDb;
        this.commandDb = commandDb;
        this.countryDb = countryDb;
        this.cityDb = cityDb
    }


    public validate(tile: Tile, name: string | null, asColony: boolean): string[] {
        const country = this.getPlayerCountry();
        const failureReasons: string[] = [];
        if (name !== null && !name) {
            failureReasons.push("Invalid name");
        }
        if (getHiddenOrNull(tile.basic.terrainType) !== TerrainType.LAND) {
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
            const owner = getHiddenOrNull(tile.political.owner)
            if ((owner !== null && (owner?.country.id !== country.identifier.id || owner?.city !== null))) {
                failureReasons.push("Invalid tile owner");
            }
            if (!this.validInfluence(tile, country)) {
                failureReasons.push("Not enough influence on tile");
            }
        } else {
            // must: country owns tile AND tile not owned by any city
            const owner = getHiddenOrNull(tile.political.owner)
            if (owner?.country.id !== country.identifier.id || owner.city !== null) {
                failureReasons.push("Invalid tile owner");
            }
        }
        return failureReasons;
    }

    public create(tile: Tile, name: string, province: ProvinceIdentifier | null) {
        this.commandService.createSettlement(tile.identifier, name, province);
    }

    private getPlayerCountry(): Country {
        return this.countryDb.querySingleOrThrow(CountryDatabase.QUERY_BY_USER_ID, this.userService.getUserId());
    }

    private isOccupied(tile: Tile): boolean {
        return this.isAlreadyOccupied(tile) || this.isPlannedOccupied(tile)
    }

    private isAlreadyOccupied(tile: Tile): boolean {
        return this.cityDb.querySingle(CityDatabase.QUERY_BY_TILE_ID, tile.identifier.id) !== null
    }

    private isPlannedOccupied(tile: Tile): boolean {
        return this.commandDb.queryMany(CommandDatabase.QUERY_BY_TYPE, CommandType.CITY_CREATE)
            .some(cmd => (cmd as CreateCityCommand).tile.id === tile.identifier.id);
    }

    private availableSettlers(country: Country): number | null {
        return getHiddenOrNull(country.settlers);
    }

    private validInfluence(tile: Tile, country: Country): boolean {
        const owner = getHiddenOrNull(tile.political.owner)
        const influences = getHiddenOrDefault(tile.political.influences, [])
        if (owner?.country.id === country.identifier.id) {
            return true;
        }
        const maxForeignInfluence = getMaxOrDefault(
            influences
                .filter(i => i.country.id !== country.identifier.id)
                .map(i => i.amount),
            e => e,
            0,
        );
        const cityTileMaxForeignInfluence = this.gameSessionDb.getGameConfig().cityTileMaxForeignInfluence;
        if (maxForeignInfluence < cityTileMaxForeignInfluence) {
            return true;
        }
        const maxOwnInfluence = getMaxOrDefault(
            influences
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