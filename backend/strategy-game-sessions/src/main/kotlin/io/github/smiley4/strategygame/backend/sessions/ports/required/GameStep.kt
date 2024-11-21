package io.github.smiley4.strategygame.backend.sessions.ports.required

import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended

internal interface GameStep {
    /**
     * Performs a single game-step
     */
    suspend fun perform(game: GameExtended, commands: Collection<Command<*>>)
}