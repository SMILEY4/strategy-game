package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.commondata.GameExtended


interface POVBuilder {

    sealed class PlayerViewCreatorError : Exception()

    /**
     * The requested game could not be found
     */
    class GameNotFoundError : PlayerViewCreatorError()


    /**
     * Build the game state of the game with the given id from the perspective of the given player
     * @throws PlayerViewCreatorError
     */
    suspend fun build(userId: String, gameId: String): JsonType


    /**
     * Build the game state of the given game from the perspective of the given player
     */
    fun build(userId: String, game: GameExtended): JsonType
}