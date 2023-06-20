package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition

interface TilesQueryByGameAndPosition {
    suspend fun execute(gameId: String, positions: List<TilePosition>): List<Tile>
}