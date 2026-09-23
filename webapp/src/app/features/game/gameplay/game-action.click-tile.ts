import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import type {SelectedTileDatabase} from "@app/features/game/database/selected-tile.database.ts";
import {gameAudio} from "@app/audio/gameAudio.ts";
import type {InteractionManager} from "@modules/interaction/interaction.manager.ts";
import {CreateTileImprovementInteraction} from "@app/features/game/gameplay/create-tile-improvement.interaction.ts";

export interface GameActionClickTile {
    click: (pos: HexPosition) => void;
}

interface Dependencies {
    tileDb: TileDatabase,
    selectedTileDb: SelectedTileDatabase,
    interactionManager: InteractionManager
}

export const gameActionClickTile = ({tileDb, selectedTileDb, interactionManager}: Dependencies): GameActionClickTile => ({
    click: (pos: HexPosition) => {

        if (interactionManager.isActive(CreateTileImprovementInteraction)) {
            interactionManager.events(CreateTileImprovementInteraction).CLICK_TILE({position: pos});
            return;
        }

        const tile = tileDb.querySingle(TileQueries.BY_POSITION, pos);
        if (tile) {
            selectedTileDb.set({selected: {...tile.position, id: tile.id}});
            gameAudio.CLICK_PRIMARY.play();
        }
    },
});