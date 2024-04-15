package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended

interface GameExtendedQuery {
    /**
     * @throws EntityNotFoundError
     */
    suspend fun execute(gameId: String): GameExtended
}