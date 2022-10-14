package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

interface TilesQueryByGameAndPosition {

    suspend fun execute(gameId: String, positions: List<TilePosition>): List<Tile>

}