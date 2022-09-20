import {Command, CommandCreateCity, CommandPlaceMarker} from "../../../models/state/command";
import {GameState} from "../../../models/state/gameState";
import {MapMode} from "../../../models/state/mapMode";
import {TilePosition} from "../../../models/state/tilePosition";
import {LocalGameStore} from "./localGameStore";

export namespace LocalGameStateHooks {

    export function useCurrentGameState(): GameState {
        return LocalGameStore.useState(state => state.currentState);
    }

    export function useSelectedTilePosition(): TilePosition | null {
        return LocalGameStore.useState(state => state.tileSelected);
    }

    export function useCommands(): Command[] {
        return LocalGameStore.useState(state => state.commands);
    }

    export function useCommandsAt(q: number, r: number): Command[] {
        return LocalGameStore.useState(state => state.commands.filter(cmd => {
            if (cmd.commandType === "place-marker") {
                const cmdMarker = cmd as CommandPlaceMarker;
                return cmdMarker.q === q && cmdMarker.r === r;
            }
            if (cmd.commandType === "create-city") {
                const cmdCity = cmd as CommandCreateCity;
                return cmdCity.q === q && cmdCity.r === r;
            }
            return false;
        }));

    }

    export function useMapMode(): [MapMode, (mode: MapMode) => void] {
        const currentMode = LocalGameStore.useState(state => state.mapMode);
        const setState = LocalGameStore.useState().setMapMode;
        return [currentMode, setState];
    }

}