import {TilePosition} from "../../models/state/tilePosition";
import {TileVisibility} from "../../models/state/tileVisibility";
import {validations} from "../../shared/validation";
import {useCountryPlayer} from "./useCountryPlayer";
import {useGameConfig} from "./useGameConfig";
import {useScoutCommands} from "./useScoutCommands";
import {useScouts} from "./useScouts";
import {useTileAt} from "./useTileAt";

export function useValidatePlaceScout(pos: TilePosition | null): boolean {

    const gameConfig = useGameConfig();
    const country = useCountryPlayer();
    const scouts = useScouts();
    const scoutCommands = useScoutCommands();
    const tile = useTileAt(pos);

    if (tile) {
        return validations(ctx => {
            ctx.validate("SCOUT.TILE_VISIBILITY", () => {
                return tile.visibility !== TileVisibility.UNKNOWN;
            });
            ctx.validate("SCOUT.TILE_SPACE", () => {
                let count = scouts
                    .filter(s => s.tile.tileId === tile.tileId)
                    .filter(s => s.countryId === country.countryId)
                    .length;
                count += scoutCommands
                    .filter(s => s.q === tile.position.q && s.r === tile.position.r)
                    .length;
                return count === 0;
            });
            ctx.validate("SCOUT.AMOUNT", () => {
                const count = scouts
                    .filter(s => s.countryId === country.countryId)
                    .length + scoutCommands.length;
                return count < gameConfig.scoutsMaxAmount;
            });
        }).isValid();
    } else {
        return false;
    }
}
