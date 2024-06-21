package io.github.smiley4.strategygame.backend.worlds.module.core.required

import io.github.smiley4.strategygame.backend.commondata.Game


interface GameUpdate {
    /**
     * @throws EntityNotFoundError
     */
    suspend fun execute(game: Game)
}