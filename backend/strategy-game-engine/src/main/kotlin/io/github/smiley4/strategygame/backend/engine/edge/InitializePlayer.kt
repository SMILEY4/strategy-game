package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.commondata.GameExtended


interface InitializePlayer {

    sealed class InitializePlayerError(message: String, cause: Throwable? = null) : Exception(message, cause)
    class GameNotFoundError(cause: Throwable? = null) : InitializePlayerError("No matching game could be found", cause)


    /**
     * Initializes the player
     * @throws InitializePlayerError
     */
    suspend fun perform(game: GameExtended, userId: String)
}