package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameExtended


interface InitializeWorld {

    sealed class InitializeWorldError(message: String?) : Exception(message)

    /**
     * Initializes the given empty game world
     * @throws InitializeWorldError
     */
    suspend fun perform(game: Game, worldSeed: Int?): GameExtended
}