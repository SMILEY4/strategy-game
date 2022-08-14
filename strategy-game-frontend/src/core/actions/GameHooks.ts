import {GameStateHooks} from "../../external/state/game/gameStateHooks";
import {GameStore} from "../../external/state/game/gameStore";
import {LocalGameStateHooks} from "../../external/state/localgame/localGameStateHooks";
import {LocalGameStore} from "../../external/state/localgame/localGameStore";
import {City} from "../../models/state/city";
import {Command, CommandCreateCity} from "../../models/state/command";
import {TerrainType} from "../../models/state/terrainType";
import {Tile} from "../../models/state/tile";

export namespace GameHooks {

    export function useCountryMoney(): number {
        const commands = LocalGameStateHooks.useCommands();
        const country = GameStateHooks.usePlayerCountry();
        return (country ? country.resources.money : 0) - commands.map(cmd => cmd.cost.money).reduce((a, b) => a + b, 0);
    }


    export function useValidateCreateCity(q: number, r: number): boolean {

        const MIN_DIST_BETWEEN_CITIES = 4.0;
        const CITY_COST = 50.0;

        const currentAmountMoney = useCountryMoney();
        const commands = LocalGameStore.useState(state => state.commands);
        const cities = GameStore.useState(state => state.cities);
        const tile = GameStateHooks.useTileAt(q, r);

        function validateTileType(tile: Tile): boolean {
            return tile.terrainType === TerrainType.LAND;
        }

        function validateCitySpacing(target: Tile, cities: City[], commands: Command[]) {
            const cityLocations: ([number, number])[] = [];
            cities.forEach(city => {
                cityLocations.push([city.tile.position.q, city.tile.position.r]);
            });
            commands
                .filter(cmd => cmd.commandType === "create-city")
                .map(cmd => cmd as CommandCreateCity)
                .forEach(cmd => {
                    cityLocations.push([cmd.q, cmd.r]);
                });
            return !cityLocations.some(city => {
                const dq = target.position.q - city[0];
                const dr = target.position.r - city[1];
                const dist = Math.sqrt(dq * dq + dr * dr);
                return dist < MIN_DIST_BETWEEN_CITIES;
            });
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
        if (!validateCitySpacing(tile, cities, commands)) {
            return false;
        }
        if (!validateResourceCost(currentAmountMoney)) {
            return false;
        }
        return true;
    }


}