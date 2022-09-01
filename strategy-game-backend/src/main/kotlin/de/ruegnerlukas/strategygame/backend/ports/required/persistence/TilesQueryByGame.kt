package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity

interface TilesQueryByGame {

    suspend fun execute(gameId: String): List<TileEntity>

}