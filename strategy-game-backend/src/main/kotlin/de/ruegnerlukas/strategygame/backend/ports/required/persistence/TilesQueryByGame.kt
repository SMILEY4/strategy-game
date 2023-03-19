package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.Tile

interface TilesQueryByGame {
    suspend fun execute(gameId: String): List<Tile>
}