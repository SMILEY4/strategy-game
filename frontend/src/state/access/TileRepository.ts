import {RemoteGameStateRepository} from "./RemoteGameStateRepository";
import {Tile, TileIdentifier} from "../../models/tile";
import {TileContainer} from "../../models/tileContainer";
import {RemoteGameStateStore} from "../remote/RemoteGameStore";
import {LocalGameStore} from "../local/LocalGameStore";

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

    public setSelectedTile(tile: TileIdentifier | null) {
        LocalGameStore.useState.getState().setSelectedTile(tile);
    }

    public getSelectedTile(): TileIdentifier | null {
        return LocalGameStore.useState.getState().selectedTile;
    }

    public setHoverTile(tile: TileIdentifier | null) {
        LocalGameStore.useState.getState().setHoverTile(tile);
    }

    public getHoverTile(): TileIdentifier | null {
        return LocalGameStore.useState.getState().hoverTile;
    }

}

export namespace TileRepository {

    export function useTileById(tileIdentifier: TileIdentifier | null): Tile | null {
        return RemoteGameStateStore.useState(state => state.gameState.tiles.getTileOrNull(tileIdentifier?.id || ""));
    }

    export function useSelectedTile(): TileIdentifier | null {
        return LocalGameStore.useState(state => state.selectedTile);
    }

}