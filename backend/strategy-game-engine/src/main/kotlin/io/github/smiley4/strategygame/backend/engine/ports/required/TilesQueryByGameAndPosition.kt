package io.github.smiley4.strategygame.backend.engine.ports.required

import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.models.Tile


interface TilesQueryByGameAndPosition {
    suspend fun execute(gameId: String, positions: Collection<TilePosition>): List<Tile>
}