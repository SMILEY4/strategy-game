import {TileSummary} from "../../../models/tile/tileSummary";
import {usePartialSingletonEntity, useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {Tile} from "../../../models/tile/tile";
import {TileDatabase} from "../../database/tileDatabase";
import {WorldObjectDatabase} from "../../database/worldObjectDatabase";
import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {gameInteractionEngine} from "../game.interaction-engine";
import {
    WorldObjectMoveInteractionContext,
    worldObjectMoveInteractionDefinition,
} from "../worldobject/worldobject.interaction.move";
import {
    SettlementCreateInteractionContext,
    settlementCreateInteractionDefinition,
} from "../settlement/settlement.interaction.create";
import {Db} from "../../database";
import {DbCache} from "../../../common/db/dbCache";

let tilesCache: DbCache<Tile[]> | null = null;

function getTileCache(): DbCache<Tile[]> {
    if (tilesCache) return tilesCache;
    tilesCache = new DbCache({
        dataProvider: () => TileStateAccess.getAllUncached(),
        dependencies: [Db.tile],
    });
    return tilesCache;
}

export const TileStateAccess = {

    useSelectedTile(): TileSummary | null {
        return usePartialSingletonEntity(Db.gameSession, e => e.selectedTile);
    },

    useTileById(id: Tile.Id | null | undefined): Tile | null {
        return useQuerySingle(Db.tile, TileDatabase.QUERY_BY_ID, id);
    },

    getTilesRevId(): string {
        return Db.tile.getRevId();
    },

    getAll(): Tile[] {
        return getTileCache().get()
    },

    getAllUncached(): Tile[] {
        return Db.tile.queryMany(TileDatabase.QUERY_ALL, null)
            .map(tile => ({
                id: tile.id,
                position: tile.position,
                visibility: tile.visibility,
                base: tile.base,
                worldObjects: Db.worldObject
                    .queryMany(WorldObjectDatabase.QUERY_BY_POSITION, [tile.position.q, tile.position.r])
                    .map(it => WorldObjectSummary.from(it)),
                metaProperties: tile.metaProperties,
            }));
    },

    getSelected(): TileSummary | null {
        return Db.gameSession.get().selectedTile;
    },

    getHovered(): TileSummary | null {
        return Db.gameSession.get().hoverTile;
    },

    getHighlights(): Tile.Highlight[] {
        let selectedTileHighlight: Tile.Highlight | null = null;
        const selectedTile = TileStateAccess.getSelected();
        if (selectedTile) {
            selectedTileHighlight = {
                type: Tile.HighlightType.Active,
                position: selectedTile.position,
                id: selectedTile.id,
            };
        }

        if (gameInteractionEngine.getInteractionId() === worldObjectMoveInteractionDefinition.id) {
            const context = gameInteractionEngine.getInteractionContext<WorldObjectMoveInteractionContext>();
            const highlights = context?.targets.map(target => ({
                type: Tile.HighlightType.Option,
                position: target.tile.position,
                id: target.tile.id,
            })) ?? [];
            return selectedTileHighlight ? [selectedTileHighlight, ...highlights] : highlights;
        }

        if (gameInteractionEngine.getInteractionId() === settlementCreateInteractionDefinition.id) {
            const context = gameInteractionEngine.getInteractionContext<SettlementCreateInteractionContext>();
            const options = context?.validTiles.map(it => ({
                type: Tile.HighlightType.Option,
                position: it.position,
                id: it.id,
            })) ?? [];
            const selectedOption = context?.tile
                ? [{
                    type: Tile.HighlightType.OptionSelected,
                    position: context?.tile!.position,
                    id: context?.tile!.id,
                }]
                : [];
            return selectedTileHighlight ? [selectedTileHighlight, ...options, ...selectedOption] : selectedOption;
        }

        return selectedTileHighlight ? [selectedTileHighlight] : [];
    },

};