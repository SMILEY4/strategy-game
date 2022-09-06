import {GameStateHooks} from "../../external/state/game/gameStateHooks";
import {GameStore} from "../../external/state/game/gameStore";
import {GameConfigStateHooks} from "../../external/state/gameconfig/gameConfigStateHooks";
import {LocalGameStateHooks} from "../../external/state/localgame/localGameStateHooks";
import {LocalGameStore} from "../../external/state/localgame/localGameStore";
import {City} from "../../models/state/city";
import {CommandPlaceScout} from "../../models/state/command";
import {Scout} from "../../models/state/scout";
import {TerrainType} from "../../models/state/terrainType";
import {Tile} from "../../models/state/tile";
import {TileVisibility} from "../../models/state/tileVisibility";
import {orDefault} from "../../shared/utils";

export namespace GameHooks {

    import useGameConfig = GameConfigStateHooks.useGameConfig;
    import usePlayerCountry = GameStateHooks.usePlayerCountry;

    export function useCountryMoney(): number {
        const commands = LocalGameStateHooks.useCommands();
        const country = GameStateHooks.usePlayerCountry();
        const money = ((country && country.advancedData) ? country.advancedData.resources.money : 0);
        const commandCost = commands.map(cmd => cmd.cost.money).reduce((a, b) => a + b, 0);
        return money - commandCost;
    }


    export function useValidateCreateCity(q: number, r: number): boolean {

        const gameConfig = useGameConfig();
        const country = usePlayerCountry()!!;
        const currentAmountMoney = useCountryMoney();
        const cities = GameStore.useState(state => state.cities);
        const tile = GameStateHooks.useTileAt(q, r);

        function validateVisibility(tile: Tile): boolean {
            return tile.visibility === TileVisibility.VISIBLE || tile.visibility === TileVisibility.DISCOVERED;
        }

        function validateTileType(tile: Tile): boolean {
            return tile.generalData?.terrainType === TerrainType.LAND;
        }

        function validateTileOwner(countryId: string, tile: Tile): boolean {
            return !(tile.generalData?.owner && tile.generalData?.owner.countryId != countryId);
        }

        function validateTileInfluence(countryId: string, tile: Tile): boolean {
            // country owns tile
            if (tile.generalData?.owner?.countryId == countryId) {
                return true;
            }
            if (tile.advancedData) {
                // nobody else has more than 'MAX_TILE_INFLUENCE' influence
                const maxForeignInfluence = Math.max(...tile.advancedData.influences.filter(i => i.countryId !== countryId).map(i => i.value));
                if (maxForeignInfluence < gameConfig.cityTileMaxForeignInfluence) {
                    return true;
                }
                // country has the most influence on tile
                const countryInfluence = orDefault(tile.advancedData.influences.find(i => i.countryId === countryId)?.value, 0.0);
                return countryInfluence >= maxForeignInfluence;
            } else {
                return true;
            }
        }

        function validateTileCity(tile: Tile, cities: City[]): boolean {
            return !cities.find(c => c.tile.tileId === tile.tileId);
        }

        function validateResourceCost(availableMoney: number) {
            return availableMoney >= gameConfig.cityCost;
        }

        if (tile) {
            return [
                validateVisibility(tile),
                validateTileType(tile),
                validateTileOwner(country.countryId, tile),
                validateTileCity(tile, cities),
                validateTileInfluence(country.countryId, tile),
                validateResourceCost(currentAmountMoney)
            ].every(e => e);
        } else {
            return false;
        }
    }


    export function useValidatePlaceScout(q: number, r: number): boolean {

        const gameConfig = useGameConfig();
        const country = usePlayerCountry()!!;
        const scouts = GameStore.useState(state => state.scouts);
        const scoutCommands = LocalGameStore.useState(state => state.commands.filter(c => c.commandType === "place-scout") as CommandPlaceScout[]);
        const tile = GameStateHooks.useTileAt(q, r);

        function validateTileVisibility(tile: Tile) {
            return tile.visibility !== TileVisibility.UNKNOWN;
        }

        function validateFreeTile(tile: Tile, countryId: string, scouts: Scout[], commands: CommandPlaceScout[]) {
            let count = scouts
                .filter(s => s.tile.tileId === tile.tileId)
                .filter(s => s.countryId === countryId)
                .length;
            count += commands
                .filter(s => s.q === tile.position.q && s.r === tile.position.r)
                .length
            return count === 0;
        }

        function validateScoutCount(scouts: Scout[], commands: CommandPlaceScout[], countryId: string, maxScouts: number) {
            const count = scouts
                .filter(s => s.countryId === countryId)
                .length + commands.length;
            return count < maxScouts;
        }

        if (tile) {
            return [
                validateTileVisibility(tile),
                validateFreeTile(tile, country.countryId, scouts, scoutCommands),
                validateScoutCount(scouts, scoutCommands, country.countryId, gameConfig.scoutsMaxAmount),
            ].every(e => e);
        } else {
            return false;
        }
    }


}