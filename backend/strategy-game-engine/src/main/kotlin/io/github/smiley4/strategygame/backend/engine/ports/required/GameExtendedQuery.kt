package io.github.smiley4.strategygame.backend.engine.ports.required

import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended


interface GameExtendedQuery {
    /**
     * @throws EntityNotFoundError
     */
    suspend fun execute(gameId: String): GameExtended
}