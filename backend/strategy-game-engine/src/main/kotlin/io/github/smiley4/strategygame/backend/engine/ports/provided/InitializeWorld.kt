package io.github.smiley4.strategygame.backend.engine.ports.provided

import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings


interface InitializeWorld {

    sealed class InitializeWorldError : Exception()

    /**
     * The requested game could not be found
     */
    class GameNotFoundError : InitializeWorldError()


    /**
     * Initializes the game world
     * @throws InitializeWorldError
     */
    suspend fun perform(gameId: String, worldSettings: WorldGenSettings)
}