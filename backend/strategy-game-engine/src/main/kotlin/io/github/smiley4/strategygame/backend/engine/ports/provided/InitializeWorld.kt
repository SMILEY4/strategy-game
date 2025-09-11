package io.github.smiley4.strategygame.backend.engine.ports.provided

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameExtended


interface InitializeWorld {
    /**
     * Initializes the given empty game world
     */
    suspend fun perform(game: Game, worldSeed: Int?): GameExtended
}