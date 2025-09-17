package io.github.smiley4.strategygame.backend.engine.ports.provided

import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameState


interface GameStep {
    /**
     * Performs a single game-step
     */
    suspend fun perform(game: GameState, commands: Collection<Command<*>>)
}