import {WorldRepository} from "../../core/required/worldRepository";
import {City} from "../../models/state/city";
import {Country} from "../../models/state/country";
import {Marker} from "../../models/state/marker";
import {Scout} from "../../models/state/scout";
import {Tile} from "../../models/state/tile";
import {GameStateAccess} from "./game/gameStateAccess";
import {GameStore} from "./game/gameStore";

export class WorldRepositoryImpl implements WorldRepository {

    private readonly gameStateAccess: GameStateAccess;

    constructor(gameStateAccess: GameStateAccess) {
        this.gameStateAccess = gameStateAccess;

    }


    getRevisionId(): string {
        return this.gameStateAccess.getStateRevision();
    }


    getCompleteState(): GameStore.StateValues {
        return this.gameStateAccess.getState();
    }


    set(currentTurn: number, tiles: Tile[], countries: Country[], cities: City[], markers: Marker[], scouts: Scout[]): void {
        this.gameStateAccess.setState(currentTurn, tiles, countries, cities, markers, scouts);
    }


    getTileAt(q: number, r: number): Tile | null {
        return this.gameStateAccess.getTileAt(q, r)
    }

}