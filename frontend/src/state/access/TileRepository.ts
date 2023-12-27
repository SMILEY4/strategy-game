import {RemoteGameStateRepository} from "./RemoteGameStateRepository";
import {Tile, TileIdentifier} from "../../models/tile";
import {TileContainer} from "../../models/tileContainer";
import {RemoteGameStateStore} from "../remote/RemoteGameStore";

export class TileRepository {

    private readonly remoteRepository: RemoteGameStateRepository;

    constructor(remoteRepository: RemoteGameStateRepository) {
        this.remoteRepository = remoteRepository;
    }

    public getTiles(): Tile[] {
        return this.remoteRepository.getGameState().tiles.getTiles();
    }

    public getTileContainer(): TileContainer {
        return this.remoteRepository.getGameState().tiles;
    }

}

export namespace TileRepository {

    export function useTileById(tileIdentifier: TileIdentifier | null): Tile | null {
        return RemoteGameStateStore.useState(state => state.gameState.tiles.getTileOrNull(tileIdentifier?.id || ""));
    }

}