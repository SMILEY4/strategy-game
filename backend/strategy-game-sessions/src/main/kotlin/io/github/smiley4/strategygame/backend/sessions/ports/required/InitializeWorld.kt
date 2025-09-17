package io.github.smiley4.strategygame.backend.sessions.ports.required

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameState

internal interface InitializeWorld {
    /**
     * Initializes the given empty game world
     */
    suspend fun perform(game: Game, worldSeed: Int?): GameState
}