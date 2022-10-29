import {GameStore} from "../../external/state/game/gameStore";
import {Command, CommandCreateCity, CommandPlaceMarker} from "../models/command";
import {TilePosition} from "../models/tilePosition";

export function useCommandsAt(pos: TilePosition | null): Command[] {
    return GameStore.useState(state => state.commands.filter(cmd => {
        if (pos) {
            if (cmd.commandType === "place-marker") {
                const cmdMarker = cmd as CommandPlaceMarker;
                return cmdMarker.q === pos.q && cmdMarker.r === pos.r;
            }
            if (cmd.commandType === "create-city") {
                const cmdCity = cmd as CommandCreateCity;
                return cmdCity.q === pos.q && cmdCity.r === pos.r;
            }
        }
        return false;
    }));
}