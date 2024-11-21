package io.github.smiley4.strategygame.backend.sessions.ports.required

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.User

internal interface InitializePlayer {

    sealed class InitializePlayerError(message: String, cause: Throwable? = null) : Exception(message, cause)
    class GameNotFoundError(cause: Throwable? = null) : InitializePlayerError("No matching game could be found", cause)


    /**
     * Initializes the player
     * @throws InitializePlayerError
     */
    suspend fun perform(game: GameExtended, userId: User.Id)
}