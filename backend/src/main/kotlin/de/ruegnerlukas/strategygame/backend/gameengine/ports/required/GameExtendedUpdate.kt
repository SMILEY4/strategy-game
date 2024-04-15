package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended

interface GameExtendedUpdate {
    /**
     * @throws EntityNotFoundError
     */
    suspend fun execute(game: GameExtended)
}