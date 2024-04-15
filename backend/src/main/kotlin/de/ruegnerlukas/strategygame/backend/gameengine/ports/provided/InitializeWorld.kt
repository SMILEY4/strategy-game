package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings

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
    suspend fun perform(gameId: String, worldSettings: WorldSettings)
}