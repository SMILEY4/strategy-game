package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile

interface TilesInsert {
    suspend fun insert(tiles: Collection<Tile>, gameId: String)
}