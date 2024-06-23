package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.common.utils.RGBColor
import io.github.smiley4.strategygame.backend.commondata.GameExtended


interface InitializePlayer {

    sealed class InitializePlayerError : Exception()
    class GameNotFoundError : InitializePlayerError()


    /**
     * Initializes the player
     * @throws InitializePlayerError
     * @throws DiscoverMapAreaError
     */
    suspend fun perform(game: GameExtended, userId: String, color: RGBColor)
}