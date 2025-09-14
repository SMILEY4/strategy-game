package io.github.smiley4.strategygame.backend.sessions.ports.required

import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameState

internal interface GameStep {
    /**
     * Performs a single game-step
     */
    suspend fun perform(game: GameState, commands: Collection<Command<*>>)
}