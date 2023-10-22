import {Tile, TileIdentifier} from "../../models/tile";
import {Country} from "../../models/country";
import {getMaxOrDefault} from "../../shared/utils";
import {CommandService} from "./commandService";
import {GameStateAccess} from "../../state/access/GameStateAccess";
import {UserService} from "../user/userService";

export class CityCreationService {

    readonly cityTileMaxForeignInfluence = 3; // todo
    readonly commandService: CommandService;
    readonly userService: UserService;

    constructor(commandService: CommandService, userService: UserService) {
        this.commandService = commandService;
        this.userService = userService;
    }


    validate(tile: Tile, name: string | null, asColony: boolean): boolean {
        const country = this.getPlayerCountry();
        if (name !== null && !name) {
            return false;
        }
        if (tile.terrainType !== "LAND") {
            return false;
        }
        if (this.isOccupied(tile)) {
            return false;
        }
        if (this.availableSettlers(country) <= 0) {
            return false;
        }
        if (asColony) {
            if ((tile.owner === null || tile.owner?.country.id === country.identifier.id) && !tile.owner?.city === null) {
                return false;
            }
            if (!this.validInfluence(tile, country)) {
                return false;
            }
        } else {
            if (!(tile.owner?.country.id === country.identifier.id && tile.owner.city === null)) {
                return false;
            }
        }
        return true;

    }

    create(tile: Tile, name: string, asColony: boolean) {
        this.commandService.createSettlement(tile.identifier, name, asColony);
    }

    getPlayerCountry(): Country {
        return GameStateAccess.getCountryByUserId(this.userService.getUserId())!!;
    }

    isOccupied(tile: Tile): boolean {
        return this.getCityPositions().findIndex(t => t.id === tile.identifier.id) !== -1;
    }


    getCityPositions(): TileIdentifier[] {
        return [];
    }

    availableSettlers(country: Country): number {
        return country.settlers;
    }

    validInfluence(tile: Tile, country: Country): boolean {
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
        if (maxForeignInfluence < this.cityTileMaxForeignInfluence) {
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