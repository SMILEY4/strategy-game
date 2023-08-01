import {TerrainType} from "../models/terrainType";
import {TilePosition} from "../models/tilePosition";
import {validations} from "../../shared/validation";
import {useCities} from "./useCities";
import {useCountryPlayer} from "./useCountryPlayer";
import {useGameConfig} from "./useGameConfig";
import {useTileAt} from "./useTileAt";
import {useAvailableSettlers} from "./useAvailableSettlers";

export function useValidateCreateTown(pos: TilePosition | null): boolean {

    const gameConfig = useGameConfig();
    const country = useCountryPlayer();
    const cities = useCities();
    const tile = useTileAt(pos);
    const availableSettlers = useAvailableSettlers(country.countryId);

    if (tile) {
        return validations(ctx => {
            ctx.validate("TOWN.AVAILABLE_SETTLER", () => {
                return availableSettlers > 0;
            });
            ctx.validate("TOWN.TARGET_TILE_TYPE", () => {
                return tile.dataTier1?.terrainType === TerrainType.LAND;
            });
            ctx.validate("TOWN.TILE_SPACE", () => {
                return !cities.find(c => c.tile.tileId === tile.tileId);
            });
            ctx.validate("TOWN.TARGET_TILE_OWNER", () => {
                return tile.dataTier1?.owner?.countryId == country.countryId && tile.dataTier1?.owner?.cityId == null;
            });
        }).isValid();
    } else {
        return false;
    }
}
