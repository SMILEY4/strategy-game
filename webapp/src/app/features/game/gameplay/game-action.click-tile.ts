import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import type {SelectedTileDatabase} from "@app/features/game/database/selected-tile.database.ts";
import {gameAudio} from "@app/audio/gameAudio.ts";

export interface GameActionClickTile {
    click: (pos: HexPosition) => void;
}

interface Dependencies {
    tileDb: TileDatabase,
    selectedTileDb: SelectedTileDatabase
}

export const gameActionClickTile = ({tileDb, selectedTileDb}: Dependencies): GameActionClickTile => ({
    click: (pos: HexPosition) => {
        const tile = tileDb.querySingle(TileQueries.BY_POSITION, pos);
        if (tile) {
            selectedTileDb.set({selected: {...tile.position, id: tile.id}});
            gameAudio.CLICK_PRIMARY.play()
        }
    },
});