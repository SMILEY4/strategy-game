package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.DiscoverMapArea.DiscoverMapAreaError

interface InitializePlayer {

    sealed class InitializePlayerError : Exception()

    class GameNotFoundError : InitializePlayerError()


    /**
     * Initializes the player
     * @throws InitializePlayerError
     * @throws DiscoverMapAreaError
     */
    suspend fun perform(gameId: String, userId: String, color: RGBColor)
}