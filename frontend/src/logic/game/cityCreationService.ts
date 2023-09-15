import {Tile, TileIdentifier} from "../../models/tile";
import {Country} from "../../models/country";
import {getMaxOrDefault} from "../../shared/utils";
import {GameRepository} from "./gameRepository";

export class CityCreationService {

    readonly cityTileMaxForeignInfluence = 3 // todo
    readonly gameRepository: GameRepository

    constructor(gameRepository: GameRepository) {
        this.gameRepository = gameRepository;
    }

    validate(tile: Tile, name: string | null, withNewProvince: boolean | null): boolean {
        const country = this.getPlayerCountry();
        if (name !== null && !name) {
            return false
        }
        if (tile.terrainType !== "land") {
            return false
        }
        if (this.isOccupied(tile)) {
            return false
        }
        if (this.availableSettlers(country) <= 0) {
            return false
        }
        if (withNewProvince !== null) {
            if (withNewProvince) {
                if ((tile.owner === null || tile.owner?.country.id === country.identifier.id) && tile.owner?.city === null) {
                    return false;
                }
                if (!this.validInfluence(tile, country)) {
                    return false
                }
            } else {
                if (tile.owner?.country.id === country.identifier.id && tile.owner.city === null) {
                    return false;
                }
            }
        }
        return true

    }

    create(tile: Tile, name: string, withNewProvince: boolean) {
        console.log("create city", tile, name, withNewProvince)
    }

    getPlayerCountry(): Country {
        const playerCountryId = "germany" // todo
        return this.gameRepository.getCountry(playerCountryId)!!
    }

    isOccupied(tile: Tile): boolean {
        return this.getCityPositions().findIndex(t => t.id === tile.identifier.id) !== -1
    }


    getCityPositions(): TileIdentifier[] {
        return []
    }

    availableSettlers(country: Country): number {
        return country.settlers
    }

    validInfluence(tile: Tile, country: Country): boolean {
        if (tile.owner?.country.id === country.identifier.id) {
            return true
        }
        const maxForeignInfluence = getMaxOrDefault(
            tile.influences
                .filter(i => i.country.id !== country.identifier.id)
                .map(i => i.amount),
            e => e,
            0
        )
        if (maxForeignInfluence < this.cityTileMaxForeignInfluence) {
            return true
        }
        const maxOwnInfluence = getMaxOrDefault(
            tile.influences
                .filter(i => i.country.id === country.identifier.id)
                .map(i => i.amount),
            e => e,
            0
        )
        if (maxOwnInfluence >= maxForeignInfluence) {
            return true;
        }
        return false;
    }

}