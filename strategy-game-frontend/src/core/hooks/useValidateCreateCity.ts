import {TerrainType} from "../models/terrainType";
import {TilePosition} from "../models/tilePosition";
import {validations} from "../../shared/validation";
import {useCities} from "./useCities";
import {useCountryPlayer} from "./useCountryPlayer";
import {useGameConfig} from "./useGameConfig";
import {useTileAt} from "./useTileAt";
import {useAvailableSettlers} from "./useAvailableSettlers";

export function useValidateCreateCity(pos: TilePosition | null): boolean {

    const gameConfig = useGameConfig();
    const country = useCountryPlayer();
    const cities = useCities();
    const tile = useTileAt(pos);
    const availableSettlers = useAvailableSettlers(country.countryId);

    if (tile) {
        return validations(ctx => {
            ctx.validate("CITY.AVAILABLE_SETTLER", () => {
                return availableSettlers > 0;
            });
            ctx.validate("CITY.TARGET_TILE_TYPE", () => {
                return tile.dataTier1?.terrainType === TerrainType.LAND;
            });
            ctx.validate("CITY.TILE_SPACE", () => {
                return !cities.find(c => c.tile.tileId === tile.tileId);
            });
            ctx.validate("CITY.TARGET_TILE_OWNER", () => {
                return (tile.dataTier1?.owner == null || tile.dataTier1.owner.countryId == country.countryId) && tile.dataTier1?.owner?.cityId == null;
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