import {TerrainType} from "../models/terrainType";
import {TilePosition} from "../models/tilePosition";
import {validations} from "../../shared/validation";
import {useCities} from "./useCities";
import {useCountryMoney} from "./useCountryMoney";
import {useCountryPlayer} from "./useCountryPlayer";
import {useGameConfig} from "./useGameConfig";
import {useTileAt} from "./useTileAt";

export function useValidateCreateCity(pos: TilePosition | null): boolean {

    const gameConfig = useGameConfig();
    const country = useCountryPlayer();
    const currentAmountMoney = useCountryMoney();
    const cities = useCities();
    const tile = useTileAt(pos);

    if (tile) {
        return validations(ctx => {
            ctx.validate("CITY.TARGET_TILE_TYPE", () => {
                return tile.dataTier1?.terrainType === TerrainType.LAND;
            });
            ctx.validate("CITY.TILE_SPACE", () => {
                return !cities.find(c => c.tile.tileId === tile.tileId);
            });
            ctx.validate("CITY.RESOURCES", () => {
                return currentAmountMoney >= gameConfig.cityCostMoney;
            });
            ctx.validate("CITY.TARGET_TILE_OWNER", () => {
                return tile.dataTier1?.owner == null || tile.dataTier1.owner.countryId == country.countryId;
            });
            ctx.validate("CITY.COUNTRY_INFLUENCE", () => {
                if (tile.dataTier2) {
                    // country owns tile
                    if (tile.dataTier1?.owner?.countryId == country.countryId) {
                        return true;
                    }
                    // nobody else has more than 'MAX_TILE_INFLUENCE' influence
                    const maxForeignInfluence = Math.max(...tile.dataTier2.influences.filter(i => i.countryId !== country.countryId).map(i => i.amount));
                    if (maxForeignInfluence < gameConfig.cityTileMaxForeignInfluence) {
                        return true;
                    }
                    // country has the most influence on tile
                    const maxCountryInfluence = Math.max(...tile.dataTier2.influences.filter(i => i.countryId === country.countryId).map(i => i.amount));
                    return maxCountryInfluence >= maxForeignInfluence;
                } else {
                    return true;
                }
            });
        }).isValid();
    } else {
        return false;
    }
}