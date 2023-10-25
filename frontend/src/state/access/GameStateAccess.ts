import {RemoteGameState} from "../remote/RemoteGameState";
import {RemoteGameStateStore} from "../remote/RemoteGameStore";
import {Tile, TileIdentifier} from "../../models/tile";
import {Country} from "../../models/country";
import {Province} from "../../models/province";
import {City} from "../../models/city";
import {TileContainer} from "../../models/tileContainer";
import {LocalGameStore} from "../local/game/LocalGameStore";
import {MapMode} from "../../models/mapMode";

export namespace GameStateAccess {

    export function getGameState(): RemoteGameState {
        return RemoteGameStateStore.useState.getState();
    }

    export function setGameState(state: RemoteGameState) {
        RemoteGameStateStore.useState.getState().set(state);
    }

    export function getCities(): City[] {
        return getGameState().cities;
    }

    export function getTiles(): Tile[] {
        return getTileContainer().getTiles();
    }

    export function getTileContainer(): TileContainer {
        return getGameState().tiles;
    }

    export function useTileById(tileIdentifier: TileIdentifier | null): Tile | null {
        return RemoteGameStateStore.useState(state => state.tiles.getTileOrNull(tileIdentifier?.id || ""));
    }

    export function setSelectedTile(tile: TileIdentifier | null) {
        LocalGameStore.useState.getState().setSelectedTile(tile);
    }

    export function getSelectedTile(): TileIdentifier | null {
        return LocalGameStore.useState.getState().selectedTile;
    }

    export function useSelectedTile(): TileIdentifier | null {
        return LocalGameStore.useState(state => state.selectedTile);
    }

    export function setHoverTile(tile: TileIdentifier | null) {
        LocalGameStore.useState.getState().setHoverTile(tile);
    }

    export function getHoverTile(): TileIdentifier | null {
        return LocalGameStore.useState.getState().hoverTile;
    }

    export function getMapMode(): MapMode {
        return LocalGameStore.useState.getState().mapMode;
    }

    export function setMapMode(mapMode: MapMode) {
        LocalGameStore.useState.getState().setMapMode(mapMode);
    }

    export function getCountry(id: string): Country | null {
        const country = getGameState().countries.find(c => c.identifier.id === id);
        if (country) {
            return country;
        } else {
            return null;
        }
    }

    export function getCountryByUserId(userId: string): Country | null {
        const country = getGameState().countries.find(c => c.player.userId === userId);
        if (country) {
            return country;
        } else {
            return null;
        }
    }

    export function useCountryById(countryId: string): Country {
        const country = RemoteGameStateStore.useState(state => state.countries.find(c => c.identifier.id === countryId));
        if (country) {
            return country;
        } else {
            return Country.UNDEFINED;
        }
    }

    export function useCountryByUserId(userId: string): Country {
        const country = RemoteGameStateStore.useState(state => state.countries.find(c => c.player.userId === userId));
        if (country) {
            return country;
        } else {
            return Country.UNDEFINED;
        }
    }

    export function useProvinceById(provinceId: string): Province {
        const province = RemoteGameStateStore.useState(state => state.provinces.find(c => c.identifier.id === provinceId));
        if (province) {
            return province;
        } else {
            return Province.UNDEFINED;
        }
    }

    export function useCityById(cityId: string): City {
        const city = RemoteGameStateStore.useState(state => state.cities.find(c => c.identifier.id === cityId));
        if (city) {
            return city;
        } else {
            return City.UNDEFINED;
        }
    }

    export function useMapMode(): [MapMode, (mode: MapMode) => void ] {
        return [
            LocalGameStore.useState(state => state.mapMode),
            LocalGameStore.useState(state => state.setMapMode)
        ];
    }

}