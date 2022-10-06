import {GameStateHooks} from "../../external/state/game/gameStateHooks";
import {GameStore} from "../../external/state/game/gameStore";
import {GameConfigStateHooks} from "../../external/state/gameconfig/gameConfigStateHooks";
import {TerrainType} from "../../models/state/terrainType";
import {validations} from "../../shared/validation";
import {useCountryMoney} from "./useCountryMoney";

export function useValidateCreateTown(q: number, r: number): boolean {

    const gameConfig = GameConfigStateHooks.useGameConfig();
    const country = GameStateHooks.usePlayerCountry()!!;
    const currentAmountMoney = useCountryMoney();
    const cities = GameStore.useState(state => state.cities);
    const tile = GameStateHooks.useTileAt(q, r);

    if (tile) {
        return validations(ctx => {
            ctx.validate("TOWN.TARGET_TILE_TYPE", () => {
                return tile.generalData?.terrainType === TerrainType.LAND;
            });
            ctx.validate("TOWN.TILE_SPACE", () => {
                return !cities.find(c => c.tile.tileId === tile.tileId);
            });
            ctx.validate("TOWN.RESOURCES", () => {
                return currentAmountMoney >= gameConfig.townCost;
            });
            ctx.validate("TOWN.TARGET_TILE_OWNER", () => {
                return tile.generalData?.owner?.countryId == country.countryId;
            });
        }).isValid();
    } else {
        return false;
    }
}