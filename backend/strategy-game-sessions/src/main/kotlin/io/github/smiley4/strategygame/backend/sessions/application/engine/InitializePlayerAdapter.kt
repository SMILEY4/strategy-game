package io.github.smiley4.strategygame.backend.sessions.application.engine

import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.ports.required.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer as EngineInitializePlayer

internal class InitializePlayerAdapter(private val impl: EngineInitializePlayer) : InitializePlayer {

    sealed class InitializePlayerError(message: String, cause: Throwable? = null) : Exception(message, cause)
    class GameNotFoundError(cause: Throwable? = null) : InitializePlayerError("No matching game could be found", cause)

    /**
     * Initializes the player
     * @throws InitializePlayerError
     */
    override suspend fun perform(game: GameState, userId: User.Id) {
        try {
            return impl.perform(game, userId)
        } catch (e: EngineInitializePlayer.InitializePlayerError) {
            throw when (e) {
                is EngineInitializePlayer.GameNotFoundError -> InitializePlayer.GameNotFoundError(e)
            }
        }
    }
}