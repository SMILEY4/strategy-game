package io.github.smiley4.strategygame.backend.engine.ports.provided

import io.github.smiley4.strategygame.backend.common.utils.RGBColor


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