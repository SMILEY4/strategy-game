package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game

interface GameQuery {
    /**
     * @throws EntityNotFoundError
     */
    suspend fun execute(gameId: String): Game
}