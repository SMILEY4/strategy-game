package io.github.smiley4.strategygame.backend.worlds.ports.required

import io.github.smiley4.strategygame.backend.common.models.Game


interface GameUpdate {
    /**
     * @throws EntityNotFoundError
     */
    suspend fun execute(game: Game)
}