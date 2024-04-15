package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile

interface TilesUpdate {
    /**
     * @throws EntityNotFoundError
     */
    suspend fun execute(tiles: Collection<Tile>, gameId: String)
}