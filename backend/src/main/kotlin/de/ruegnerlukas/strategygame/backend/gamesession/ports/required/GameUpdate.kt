package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game

interface GameUpdate {
    /**
     * @throws EntityNotFoundError
     */
    suspend fun execute(game: Game)
}