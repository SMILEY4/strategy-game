import {GameStateHooks} from "../../../external/state/game/gameStateHooks";
import {GameStore} from "../../../external/state/game/gameStore";
import {GameConfigStateHooks} from "../../../external/state/gameconfig/gameConfigStateHooks";
import {TerrainType} from "../../../models/state/terrainType";
import {orDefault} from "../../../shared/utils";
import {validations} from "../../../shared/validation";
import {GameHooks} from "./GameHooks";

export function useValidateCreateCity(q: number, r: number): boolean {

    const gameConfig = GameConfigStateHooks.useGameConfig();
    const country = GameStateHooks.usePlayerCountry()!!;
    const currentAmountMoney = GameHooks.useCountryMoney();
    const cities = GameStore.useState(state => state.cities);
    const tile = GameStateHooks.useTileAt(q, r);

    if (tile) {
        return validations(ctx => {
            ctx.validate("CITY.TARGET_TILE_TYPE", () => {
                return tile.generalData?.terrainType === TerrainType.LAND;
            });
            ctx.validate("CITY.TILE_SPACE", () => {
                return !cities.find(c => c.tile.tileId === tile.tileId);
            })
            ctx.validate("CITY.RESOURCES", () => {
                return currentAmountMoney >= gameConfig.cityCost;
            })
            ctx.validate("CITY.TARGET_TILE_OWNER", () => {
                return tile.generalData?.owner == null || tile.generalData.owner.countryId == country.countryId;
            });
            ctx.validate("CITY.COUNTRY_INFLUENCE", () => {
                if (tile.advancedData) {
                    // country owns tile
                    if (tile.generalData?.owner?.countryId == country.countryId) {
                        return true;
                    }
                    // nobody else has more than 'MAX_TILE_INFLUENCE' influence
                    const maxForeignInfluence = Math.max(...tile.advancedData.influences.filter(i => i.countryId !== country.countryId).map(i => i.amount));
                    if (maxForeignInfluence < gameConfig.cityTileMaxForeignInfluence) {
                        return true;
                    }
                    // country has the most influence on tile
                    const maxCountryInfluence = Math.max(...tile.advancedData.influences.filter(i => i.countryId === country.countryId).map(i => i.amount))
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