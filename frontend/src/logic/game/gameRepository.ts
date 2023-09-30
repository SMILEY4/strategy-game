import {Command} from "../../models/command";
import {CommandStore} from "./store/commandStore";
import {Country} from "../../models/country";
import {CountriesStore} from "./store/countriesStore";
import {Tile} from "../../models/tile";
import {TileStore} from "./store/tileStore";
import {CameraStore} from "./store/cameraStore";
import {CameraData} from "../../models/cameraData";

export class GameRepository {

    addCommand(command: Command) {
        CommandStore.useState.getState().add(command);
    }

    removeCommand(id: string) {
        CommandStore.useState.getState().remove(id);
    }

    clearCommands() {
        CommandStore.useState.getState().set([]);
    }

    getCommands(): Command[] {
        return CommandStore.useState.getState().commands;
    }


    getCountry(id: string): Country | null {
        const elements = CountriesStore.useState.getState().countries.filter(c => c.identifier.id === id);
        if (elements) {
            return elements[0];
        } else {
            return null;
        }
    }

    getTiles(): Tile[] {
        return TileStore.useState.getState().tiles;
    }

    setTiles(tiles: Tile[]): void {
        TileStore.useState.getState().set(tiles);
    }

    getCamera(): CameraData {
        return CameraStore.useState.getState().camera
    }

    setCamera(camera: CameraData) {
        CameraStore.useState.getState().set(camera)
    }

}