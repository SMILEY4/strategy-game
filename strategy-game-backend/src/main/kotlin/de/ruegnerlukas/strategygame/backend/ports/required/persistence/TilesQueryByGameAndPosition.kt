package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity

interface TilesQueryByGameAndPosition {

    suspend fun execute(gameId: String, positions: List<TilePosition>): List<TileEntity>

}