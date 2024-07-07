package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended


interface GameStep {

    sealed class GameStepError(message: String, cause: Throwable? = null) : Exception(message, cause)

    /**
     * Performs a single game-step
     * @throws GameStepError
     */
    suspend fun perform(game: GameExtended, commands: Collection<Command<*>>)

}