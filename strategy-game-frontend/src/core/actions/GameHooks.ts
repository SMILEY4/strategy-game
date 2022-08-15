import {GameStateHooks} from "../../external/state/game/gameStateHooks";
import {GameStore} from "../../external/state/game/gameStore";
import {LocalGameStateHooks} from "../../external/state/localgame/localGameStateHooks";
import {LocalGameStore} from "../../external/state/localgame/localGameStore";
import {City} from "../../models/state/city";
import {TerrainType} from "../../models/state/terrainType";
import {Tile} from "../../models/state/tile";
import {orDefault} from "../../shared/utils";

export namespace GameHooks {

    import usePlayerCountry = GameStateHooks.usePlayerCountry;

    export function useCountryMoney(): number {
        const commands = LocalGameStateHooks.useCommands();
        const country = GameStateHooks.usePlayerCountry();
        return (country ? country.resources.money : 0) - commands.map(cmd => cmd.cost.money).reduce((a, b) => a + b, 0);
    }


    export function useValidateCreateCity(q: number, r: number): boolean {

        const CITY_COST = 50.0;
        const MAX_TILE_INFLUENCE = 3.0;

        const country = usePlayerCountry()!!;
        const currentAmountMoney = useCountryMoney();
        const commands = LocalGameStore.useState(state => state.commands);
        const cities = GameStore.useState(state => state.cities);
        const tile = GameStateHooks.useTileAt(q, r);

        function validateTileType(tile: Tile): boolean {
            return tile.terrainType === TerrainType.LAND;
        }

        function validateTileOwner(countryId: string, tile: Tile): boolean {
            return !(tile.ownerCountry && tile.ownerCountry.countryId != countryId);
        }

        function validateTileInfluence(countryId: string, tile: Tile): boolean {
            // country owns tile
            if (tile.ownerCountry?.countryId == countryId) {
                return true;
            }
            // nobody else has more than 'MAX_TILE_INFLUENCE' influence
            const maxForeignInfluence = Math.max(...tile.influences.filter(i => i.country.countryId !== countryId).map(i => i.value));
            if (maxForeignInfluence < MAX_TILE_INFLUENCE) {
                return true;
            }
            // country has the most influence on tile
            const countryInfluence = orDefault(tile.influences.find(i => i.country.countryId === countryId)?.value, 0.0);
            if (countryInfluence > maxForeignInfluence) {
                return true;
            }
            return false;
        }

        function validateTileCity(tile: Tile, cities: City[]): boolean {
            return !cities.find(c => c.tile.tileId === tile.tileId);
        }

        function validateResourceCost(availableMoney: number) {
            return availableMoney >= CITY_COST;
        }

        if (!tile) {
            return false;
        }
        if (!validateTileType(tile)) {
            return false;
        }
        if (!validateTileOwner(country.countryId, tile)) {
            return false;
        }
        if (!validateTileCity(tile, cities)) {
            return false;
        }
        if (!validateTileInfluence(country.countryId, tile)) {
            return false;
        }
        if (!validateResourceCost(currentAmountMoney)) {
            return false;
        }
        return true;
    }


}