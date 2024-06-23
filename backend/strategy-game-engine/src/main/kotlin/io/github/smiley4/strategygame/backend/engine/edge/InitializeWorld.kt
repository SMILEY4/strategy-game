package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings


interface InitializeWorld {

    sealed class InitializeWorldError(message: String?) : Exception(message)
    class GameNotFoundError : InitializeWorldError("The requested game could not be found")

    /**
     * Initializes the given empty game world
     * @throws InitializeWorldError
     */
    suspend fun perform(game: Game, worldSeed: Int?): GameExtended
}