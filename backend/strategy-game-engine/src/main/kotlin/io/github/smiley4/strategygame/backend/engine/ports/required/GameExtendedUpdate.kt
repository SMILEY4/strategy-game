package io.github.smiley4.strategygame.backend.engine.ports.required

import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended


interface GameExtendedUpdate {
    /**
     * @throws EntityNotFoundError
     */
    suspend fun execute(game: GameExtended)
}