import {TerrainType} from "../../models/state/terrainType";
import {TilePosition} from "../../models/state/tilePosition";
import {validations} from "../../shared/validation";
import {useCities} from "./useCities";
import {useCountryMoney} from "./useCountryMoney";
import {useCountryPlayer} from "./useCountryPlayer";
import {useGameConfig} from "./useGameConfig";
import {useTileAt} from "./useTileAt";

export function useValidateCreateTown(pos: TilePosition | null): boolean {

    const gameConfig = useGameConfig();
    const country = useCountryPlayer();
    const currentAmountMoney = useCountryMoney();
    const cities = useCities();
    const tile = useTileAt(pos);

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