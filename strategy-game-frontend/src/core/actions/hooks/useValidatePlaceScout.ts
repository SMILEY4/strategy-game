import {GameStateHooks} from "../../../external/state/game/gameStateHooks";
import {GameStore} from "../../../external/state/game/gameStore";
import {GameConfigStateHooks} from "../../../external/state/gameconfig/gameConfigStateHooks";
import {LocalGameStore} from "../../../external/state/localgame/localGameStore";
import {CommandPlaceScout} from "../../../models/state/command";
import {TileVisibility} from "../../../models/state/tileVisibility";
import {validations} from "../../../shared/validation";

export function useValidatePlaceScout(q: number, r: number): boolean {

    const gameConfig = GameConfigStateHooks.useGameConfig();
    const country = GameStateHooks.usePlayerCountry()!!;
    const scouts = GameStore.useState(state => state.scouts);
    const scoutCommands = LocalGameStore.useState(state => state.commands.filter(c => c.commandType === "place-scout") as CommandPlaceScout[]);
    const tile = GameStateHooks.useTileAt(q, r);

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
