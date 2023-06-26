package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile

interface TilesQueryByGame {
    suspend fun execute(gameId: String): List<Tile>
}