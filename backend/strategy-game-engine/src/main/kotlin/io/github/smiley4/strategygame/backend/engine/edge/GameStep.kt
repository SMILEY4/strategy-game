package io.github.smiley4.strategygame.backend.engine.edge

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.commondata.Command


interface GameStep {

    sealed class GameStepError : Exception()


    /**
     * The requested game could not be found
     */
    class GameNotFoundError : GameStepError()


    /**
     * Performs a single game-step
     * @return the game state from the perspective of the participating players
     * @throws GameStepError
     * @throws POVBuilder.PlayerViewCreatorError
     */
    suspend fun perform(gameId: String, commands: Collection<Command<*>>, userIds: Collection<String>): Map<String, JsonType>
}