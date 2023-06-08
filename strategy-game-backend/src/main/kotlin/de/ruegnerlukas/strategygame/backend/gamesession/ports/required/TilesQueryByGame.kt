package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

interface TilesQueryByGame {
    suspend fun execute(gameId: String): List<Tile>
}